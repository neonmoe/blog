/* A first-person 3D environment demonstrating some aspects of Quake.
 * Copyright (C) 2020  Jens Pitkanen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var scene, camera, renderer;
var level_object, raycaster;
var render_width, render_height;
var gui;
var dynamic_values = {
  render_scale: 1.0,
  camera_sensitivity: 3.0,
  field_of_view: 75.0,
  noclip: false,
  gravity: 800.0,
  movement_speed: 250.0,
  jump_velocity: 250.0,
  lean: { enable: true, lean_degrees: 2.0, lean_degs_per_sec: 200.0 },
  accel: { enable: true, acceleration: 10.0, friction: 4.0, extra_friction_velocity_threshold: 100.0 },
  bobbing: { enable: true, bob_freq: 0.6, bob_amplitude: 0.02, bob_base: 0.3 },
};

let player = {
  position: new THREE.Vector3(200.0, -150.0, 70.0),
  velocity: new THREE.Vector3(0.0, 0.0, 0.0),
  camera_height: 50.0,
  bob: 0.0,
  radius: 10.0,
  yaw: 0.0,
  pitch: 0.0,
  roll: 0.0,
  grounded: false,
  grounded_coyote_time: 0.0,
};

let controls = {
  move_forward: { value: 0.0, target: 0.0 }, move_left: { value: 0.0, target: 0.0 },
  move_backward: { value: 0.0, target: 0.0 }, move_right: { value: 0.0, target: 0.0 },
  move_up: { value: 0.0, target: 0.0 }, move_down: { value: 0.0, target: 0.0 },
  look_up: { value: 0.0, target: 0.0 }, look_left: { value: 0.0, target: 0.0 },
  look_down: { value: 0.0, target: 0.0 }, look_right: { value: 0.0, target: 0.0 },
  jump: false, debug_misc: false,
};

function update_input_state(delta_seconds) {
  let lerped_controls = ["look_up", "look_left", "look_down", "look_right"];
  for (let i = 0; i < lerped_controls.length; i++) {
    let control = controls[lerped_controls[i]];
    control.value = THREE.MathUtils.lerp(control.value, control.target, delta_seconds * 20);
  }
  let non_lerped_controls = ["move_forward", "move_left", "move_backward", "move_right", "move_up", "move_down"];
  for (let i = 0; i < non_lerped_controls.length; i++) {
    let control = controls[non_lerped_controls[i]];
    control.value = control.target;
  }
  controls.jump = false;
  controls.debug_misc = false;
}

var last_millis = 0;
function update(current_millis) {
  let delta_seconds = (current_millis - last_millis) / 1000.0;
  let total_seconds = current_millis / 1000.0;
  last_millis = current_millis;
  let render_scale = dynamic_values.render_scale;

  let new_width = window.innerWidth * render_scale;
  let new_height = window.innerHeight * render_scale;
  if (render_width != new_width || render_height != new_height || camera.fov != dynamic_values.field_of_view) {
    render_width = new_width;
    render_height = new_height;
    renderer.setSize(render_width, render_height, false);
    camera.aspect = render_width / render_height;
    camera.fov = dynamic_values.field_of_view;
    camera.updateProjectionMatrix();
  }

  // Aim for the camera to be camera_height above the ground
  let ground_direction = new THREE.Vector3(0, -player.camera_height, 0);
  let ground = raycast_at(ground_direction, 0);
  if (ground != undefined) {
    let target = player.position.clone().add(new THREE.Vector3(0, player.camera_height - ground.distance, 0));
    player.position.lerp(target, 20 * delta_seconds);
  }
  // Update groundedness
  player.grounded = raycast_at(ground_direction, 1);
  if (player.grounded) {
    player.grounded_coyote_time = total_seconds;
  }

  // Calculate player movement vector, apply to velocity
  let forward_input = controls.move_forward.value - controls.move_backward.value;
  let right_input = controls.move_right.value - controls.move_left.value;
  let up_input = dynamic_values.noclip ? controls.move_up.value - controls.move_down.value : 0;

  let forward_move_vector = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  forward_move_vector.multiplyScalar(dynamic_values.movement_speed * forward_input);
  let right_vector = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  let right_move_vector = right_vector.clone();
  right_move_vector.multiplyScalar(dynamic_values.movement_speed * right_input);
  let up_move_vector = new THREE.Vector3(0, 1, 0);
  up_move_vector.multiplyScalar(dynamic_values.movement_speed * up_input);
  let movement_vector = new THREE.Vector3()
      .add(forward_move_vector)
      .add(right_move_vector)
      .add(up_move_vector)
      .normalize();

  let previous_y_velocity = player.velocity.y;
  if (dynamic_values.accel.enable && !dynamic_values.noclip) {
    let speed = dynamic_values.movement_speed * movement_vector.length();
    let max_accel = speed - player.velocity.dot(movement_vector);
    if (max_accel > 0) {
      let acceleration = Math.min(max_accel, dynamic_values.accel.acceleration * delta_seconds * speed);
      player.velocity.add(movement_vector.multiplyScalar(acceleration));
    }

    if (player.grounded) {
      let ground_velocity = player.velocity.clone();
      ground_velocity.y = 0;
      let ground_speed = ground_velocity.length();

      // Apply friction
      let control = Math.max(ground_speed, dynamic_values.accel.extra_friction_velocity_threshold);
      let friction_factor = Math.max(0, (ground_speed - dynamic_values.accel.friction * delta_seconds * control) / ground_speed);
      player.velocity.multiplyScalar(friction_factor);
    }
  } else if (!dynamic_values.accel.enable || dynamic_values.noclip) {
    player.velocity = movement_vector.multiplyScalar(dynamic_values.movement_speed);
  }

  // In noclip, use input Y velocity, otherwise accumulate gravity
  if (dynamic_values.noclip) {
    player.velocity.y = movement_vector.y;
  } else if (controls.jump && total_seconds - player.grounded_coyote_time < 0.1) {
    player.velocity.y = dynamic_values.jump_velocity;
  } else if (player.grounded) {
    player.velocity.y = 0;
  } else {
    player.velocity.y = previous_y_velocity - dynamic_values.gravity * delta_seconds;
  }

  // For raycasting from the camera
  function raycast_at(vector, threshold) {
    if (dynamic_values.noclip) {
      // No walls in noclip!
      return undefined;
    }

    let camera_position = player.position.clone().add(new THREE.Vector3(0, player.camera_height, 0));
    let direction = vector.clone().normalize();
    raycaster.set(camera_position, direction);
    raycaster.far = vector.length() + threshold;
    return raycaster.intersectObject(level_object, true)[0];
  }

  // For stepping in a direction (but avoiding the camera going through walls with raycast_at)
  function step_toward(velocity_step) {
    if (velocity_step.length() > 0) {
      let hit = raycast_at(velocity_step, 10);
      if (hit != undefined) {
        velocity_step.projectOnPlane(hit.face.normal);
      }
      player.position.add(velocity_step);
    }
  }

  // Apply player movement (clamped based on a raycast)
  let velocity_step = player.velocity.clone().multiplyScalar(delta_seconds);
  step_toward(velocity_step.clone().projectOnVector(new THREE.Vector3(1, 0, 0)));
  step_toward(velocity_step.clone().projectOnVector(new THREE.Vector3(0, 1, 0)));
  step_toward(velocity_step.clone().projectOnVector(new THREE.Vector3(0, 0, 1)));

  let yaw_velocity = (controls.look_left.value - controls.look_right.value) * delta_seconds;
  let pitch_velocity = (controls.look_up.value - controls.look_down.value) * delta_seconds;
  player.yaw += yaw_velocity * dynamic_values.camera_sensitivity;
  player.pitch += pitch_velocity * dynamic_values.camera_sensitivity;
  player.pitch = Math.min(Math.PI / 2, Math.max(-Math.PI / 2, player.pitch));

  if (dynamic_values.lean.enable && !dynamic_values.noclip) {
    let roll_sign = -player.velocity.dot(right_vector) / dynamic_values.movement_speed;
    let rads = dynamic_values.lean.lean_degrees / 180 * Math.PI;
    let speed = dynamic_values.lean.lean_degs_per_sec / 180 * Math.PI * delta_seconds;
    let diff = roll_sign * rads - player.roll;
    if (Math.abs(diff) > speed) {
      diff = Math.sign(diff) * speed;
    }
    player.roll += diff;
  }

  if (dynamic_values.bobbing.enable && !dynamic_values.noclip) {
    let xz_velocity = player.velocity.clone();
    xz_velocity.y = 0;
    let t = total_seconds * 2 * Math.PI / dynamic_values.bobbing.bob_freq;
    player.bob = xz_velocity.length() * dynamic_values.bobbing.bob_amplitude;
    player.bob = player.bob * dynamic_values.bobbing.bob_base + player.bob * (1 - dynamic_values.bobbing.bob_base) * Math.sin(t);
  }

  camera.position.x = player.position.x;
  camera.position.y = player.position.y + player.camera_height + player.bob;
  camera.position.z = player.position.z;

  camera.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw);
  camera.rotateX(player.pitch);
  if (dynamic_values.lean.enable) {
    camera.rotateZ(player.roll);
  }

  renderer.render(scene, camera);
  update_input_state(delta_seconds);
  requestAnimationFrame(update);
}

function start() {
  gui = new dat.GUI();
  let gui_rendering = gui.addFolder("Rendering");
  gui_rendering.add(dynamic_values, "render_scale", 0.25, 2.0);
  gui_rendering.add(dynamic_values, "field_of_view", 50.0, 120.0);

  let gui_camera = gui.addFolder("Camera");
  gui_camera.add(dynamic_values, "camera_sensitivity");
  gui_camera.add(dynamic_values, "noclip");

  let gui_movement_basic = gui.addFolder("Basic Movement Vars");
  gui_movement_basic.add(dynamic_values, "gravity");
  gui_movement_basic.add(dynamic_values, "movement_speed");
  gui_movement_basic.add(dynamic_values, "jump_velocity");

  let gui_lean = gui.addFolder("Quake Observation: Leaning");
  gui_lean.add(dynamic_values.lean, "enable");
  gui_lean.add(dynamic_values.lean, "lean_degrees");
  gui_lean.add(dynamic_values.lean, "lean_degs_per_sec");
  let gui_accel = gui.addFolder("Quake Observation: Acceleration");
  gui_accel.add(dynamic_values.accel, "enable");
  gui_accel.add(dynamic_values.accel, "acceleration");
  gui_accel.add(dynamic_values.accel, "friction");
  gui_accel.add(dynamic_values.accel, "extra_friction_velocity_threshold");
  let gui_bobbing = gui.addFolder("Quake Observation: Bobbing");
  gui_bobbing.add(dynamic_values.bobbing, "enable");
  gui_bobbing.add(dynamic_values.bobbing, "bob_freq");
  gui_bobbing.add(dynamic_values.bobbing, "bob_amplitude");
  gui_bobbing.add(dynamic_values.bobbing, "bob_base", 0, 1);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(dynamic_values.field_of_view, 1, 1, 2000);
  renderer = new THREE.WebGLRenderer();
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  raycaster = new THREE.Raycaster();

  document.body.appendChild(renderer.domElement);

  let createElement = function(parent, name, text) {
    let element = document.createElement(name);
    element.textContent = text;
    parent.appendChild(element);
    return element;
  };

  let credits_root = createElement(document.body, "details", "");
  credits_root.className = "credits";
  let credits_header = createElement(credits_root, "summary", "Assets used:");
  let level = createElement(credits_root, "a", "Quake level (recreation?) by vrchris, under the CC-BY-4.0 license");
  level.href = "https://sketchfab.com/3d-models/quake-1-dm4-the-bad-place-deathmatch-b86569c202fa455b8d221e90c5588cc7";

  let controls_root = createElement(document.body, "details", "");
  controls_root.className = "instructions";
  let controls_header = createElement(controls_root, "summary", "Controls:");
  let controls_movement = createElement(controls_root, "p", "- Movement: WASD");
  let controls_jump = createElement(controls_root, "p", "- Jump: Space");
  let controls_look = createElement(controls_root, "p", "- Look: Arrow keys");
  let controls_updown = createElement(controls_root, "p", "- Up / down (noclip): Space / left shift");

  scene.add(new THREE.HemisphereLight(0xffffff, 0x0f0f0f, 10.0));

  let gltf_loader = new THREE.GLTFLoader();
  gltf_loader.load("scene.gltf", function(gltf) {
    let lightMaterial = "DGamesQuakeid1pak0_filesmapse1m1metal5_8";
    function recurse(mesh) {
      // Process submesh
      if (mesh.material !== undefined && mesh.material.name.startsWith(lightMaterial)) {
        mesh.material.emissive = new THREE.Color(0xffffff);
        mesh.material.emissiveMap = mesh.material.map;
        mesh.material.emissiveIntensity = 1.5;
      }

      for (let i = 0; i < mesh.children.length; i++) {
        recurse(mesh.children[i]);
      }
    };
    recurse(gltf.scene);
    level_object = gltf.scene;
    scene.add(gltf.scene);

    // Start the game:
    update(0);
  }, undefined, function(error) {
    console.log(error);
  });
}

function set_control_value(key_code, value) {
  // WASD: 87, 65, 83, 68
  // Arrow up/left/down/right: 38, 37, 40, 39
  switch (key_code) {
  case 32: controls.move_up.target = value; controls.jump = value > 0.5; return true;
  case 16: controls.move_down.target = value; return true;
  case 87: controls.move_forward.target = value; return true;
  case 65: controls.move_left.target = value; return true;
  case 83: controls.move_backward.target = value; return true;
  case 68: controls.move_right.target = value; return true;
  case 38: controls.look_up.target = value; return true;
  case 37: controls.look_left.target = value; return true;
  case 40: controls.look_down.target = value; return true;
  case 39: controls.look_right.target = value; return true;
  case 76: controls.debug_misc = value > 0.5; return true;
  default:
    return false;
  }
}

document.body.onkeydown = function(event) {
  if (set_control_value(event.keyCode, 1.0)) {
    event.preventDefault();
  }
}

document.body.onkeyup = function(event) {
  if (set_control_value(event.keyCode, 0.0)) {
    event.preventDefault();
  }
}

// From: https://github.com/mrdoob/three.js/blob/master/examples/jsm/WebGL.js
function is_webgl_available() {
  try {
    var canvas = document.createElement("canvas");
    return !! (window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}

if (is_webgl_available()) {
  start();
} else {
  let warning_element = document.createElement("p");
  warning_element.textContent = "Your browser seems to lack WebGL support. ";
  let link_element = document.createElement("a");
  link_element.textContent = "Get Firefox today!";
  link_element.href = "https://www.mozilla.org/en-US/firefox/new/";
  warning_element.appendChild(link_element);
  document.body.appendChild(warning_element);
}
