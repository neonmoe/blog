## Quake studies

To start this off, I would like to make the disclaimer that I am not a
professional Quake player. In fact, I have only played Quake 1 and
Quake Live, and my combined playtime is in the magnitude of hours, not
tens or thousands.

That said, every now and then, I get the feeling to play Quake. One
should play the classics, right? The feeling never seems to last, but
I do always enjoy Quake's movement. Delightful to zoom around that
starting chamber. Since I am currently working on a first-person
puzzle game, I figure I should find out what makes Quake feel so good,
to replicate that feeling in my game.

### Observation: leaning

The most visually distinct "effect" in Quake is the way the camera
leans when strafing. This might also be happening when you move
forward and turn---which could imply that this lean is actually based
on the player's velocity on the right/left axis, and that turning has
a bit of inertia---but the effect is hard to detect by just
eyeballing. It should also be noted, that this lean does not apply to
the gun in the middle: it actually accentuates the lean by staying
upright.

<video width="400pt" controls loop preload="auto">
	<source src="https://blog.neon.moe/2020/04/03/sample.webm" type="video/webm">
	<source src="sample.webm" type="video/webm">
	<source src="https://blog.neon.moe/2020/04/03/sample.mp4" type="video/mp4">
	<source src="sample.mp4" type="video/mp4">
	<p>
		You can download a demonstration video here:
		<a href="https://blog.neon.moe/2020/04/03/sample.webm">WebM</a>,
		<a href="https://blog.neon.moe/2020/04/03/sample.mp4">MP4</a>.
	</p>
</video>


### Observation: bobbing

The camera bobs slightly on the up/down axis, while the gun has a more
pronounced bob, down and towards the player. The gun doesn't seem to
bob in a sine wave either, like the camera: it seems to stay
relatively still, until it dips noticeably whenever the camera
dips. Modern gun bobs are more elaborate, but I do think there is a
certain charm to Quake's bob.

### Observation: acceleration

When releasing the movement keys, the player will slow to a stop over
a short period of time. I can not tell if there is acceleration when
you start moving, but if there is, it is very sharp. Still, moving
forward does feel very smooth, so maybe it does accelerate over a few
frames. This effect is even more pronounced in Quake Live: the
movement feels *really* smooth. I hope the source will enlighten me
further on this.

### Source

If you would like to check out the source for yourself, it is on [id's
GitHub][quake-src].

<div class="comment"> /* About the code: It is delightfully
readable. There is something about games made by big companies that
makes them seem intimidating to me, so it is always suprising to find
that they have been made by humans much like you and me. */ </div>

#### Leaning

Lucky me, the leaning code is the [first function of
view.c][view.c:81]. The lean is based on the player's velocity on the
right axis, as I suspected, and it seems linear. Simple to implement,
for a nice effect.

#### Bobbing

Head bobbing is implemented [in the very next function of
view.c][view.c:112]. The code is pretty much what you'd expect, with a
bobbing period of 0.6 seconds. The bobbing intensity is based on the
player's velocity on the XY plane. This is good for fading out the
effect, taking into account how quickly the player accelerates /
brakes.

Turns out, the gun does not actually bob up and down with varying
speed: it bobs in sync with the camera, *forwards and
backwards*. Because of how perspective projection works, the effect is
more pronounced as it gets closer to the camera, which led me to
believe the bob is not a sine wave, assuming the motion was
up/down. This is why it is great to have the source available!

<div class="comment"> /* Something I thought was interesting: there is
a commented bit of code that would make the gun sway horizontally as
well. */ </div>

#### Friction

Next up, from sv_user.c: [SV_UserFriction][sv_user.c:122].

The friction function is probably the spiciest code I have reviewed
for this post, it's easiest to demonstrate by just showing the code
(edited for readability):

```c
float speed = length(velocity.xz);

float control = speed < sv_stopspeed.value ? sv_stopspeed.value : speed;
float newspeed = (speed - host_frametime * control * friction) / speed;

if (newspeed < 0) newspeed = 0;

velocity *= newspeed;
```

Is that not wild? Maybe not. It is basically just like, friction, but
what gets me is the `control` variable. The amount of friction applied
goes down as your velocity decreases, until you pass the "stop speed"
threshold, after which the friction stays constant. This causes this
sort of braking effect in game, which I really enjoy.

#### Acceleration

The acceleration function is what you would expect, like the friction
was, but has no extra spices: [SV_Accelerate][sv_user.c:190]
calculates an acceleration value based on the target speed, then
applies that acceleration to the player's velocity. The acceleration
is *10 * frametime * wishspeed*, so *wishspeed* is reached in about a
tenth of a second, according to my napkin calculations. 100
milliseconds is many frames! I am not sure how I was fooled into
thinking the movement was so sharp I could not tell if there was
acceleration, but testing it out now, the acceleration is quite
clear. Never trust eyeballed observations!

### Demo

I originally intended on putting the demo right here, but I thought
it'd be better to warn you before loading up a game in your
browser. So be warned, the demo link will open a web game written in
JavaScript, with [three.js][three.js]. Controls: WASD to move, arrow
keys to look around, space to jump. Mind the non-axis-aligned walls,
they are not quite solid. [Demo][demo].

### Final thoughts

What did I learn? That I should never trust my own judgement on
movement. Also, that a good acceleration function combined with a good
friction function make for some good movement! With a little bobbing
and leaning sprinkled on top, you get some *excellent* movement out of
a few lines of code.

I hope you learned something, or were entertained. Nevertheless, if
you have comments, feel free to aim them at my [Fediverse inbox][fedi]
or [my email][email].

[quake-src]: https://github.com/id-software/quake "Quake on GitHub"
[view.c]: https://github.com/id-software/quake/tree/master/WinQuake/view.c "WinQuake/view.c on GitHub"
[view.c:81]: https://github.com/id-software/quake/tree/master/WinQuake/view.c#L81 "WinQuake/view.c line 81 (V_CalcRoll) on GitHub"
[view.c:112]: https://github.com/id-software/quake/tree/master/WinQuake/view.c#L112 "WinQuake/view.c line 112 (V_CalcBob) on GitHub"
[sv_user.c:122]: https://github.com/id-software/quake/tree/master/WinQuake/sv_user.c#L122 "WinQuake/sv_user.c line 122 (SV_UserFriction)on GitHub"
[sv_user.c:190]: https://github.com/id-software/quake/tree/master/WinQuake/sv_user.c#L190 "WinQuake/sv_user.c line 190 (SV_Accelerate) on GitHub"
[three.js]: https://threejs.org "The homepage of the Three.js 3D rendering library"
[demo]: demo/index.html "An FPS demo, showing off ideas written about in this blog"
[fedi]: https://fedi.neon.moe/neon "My fediverse account"
[email]: mailto:jens@neon.moe "My public email"
