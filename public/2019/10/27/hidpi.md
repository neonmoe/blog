## DPI scaling factors
So screens today are quite high resolution. For example, I have a
2560x1440 resolution screen as my main viewport to the digital
world. While lots of pixels can be used to make very sharp graphics,
they also present a problem\: old applications are still drawing
letters that are 16 pixels high, which are very small on these
screens! There are at least two solutions to this:

- Stop working in pixels, and start working in physical units instead
  when making graphics, and let the underlying graphics systems handle
  the conversion into pixels. This way, one string of text is the same
  size on every screen, but might not be what we want: desktop screens
  are viewed from a further distance than phones, which would make
  text either too big on phones, or too small on desktops.

- Keep working in pixels, and keep thinking in terms of "this text
  should be printed at a font size of 16 pixels," but secretly
  multiply all values by some factor depending on how high resolution
  your screen is, and how far people are generally going to look at
  the screen. So, you might use a multiplier of 2x for a 4K desktop
  screen, or even 3x for a 2K phone screen. I'll be calling this
  multiplier the "DPI scaling factor" from now on.

It should seem relatively obvious that we have gone the second
route. People are doing everything on phones nowadays, so whatever
system we come up with has to fit that need with minimal developer
effort. I kind of wish we had gone the first route, as it would've
annihilated any hopes of even trying to think in pixels, which
might've led us to some vector-graphics-based paradise where every
graphic is smooth and well antialiased. Sadly, this is not the case,
and everyone is still rendering bitmaps that may or may not be the
same resolution as the picture that ends up on the screen of the user.

Based on my experience, it seems that the current way to get nice
looking sprites on screens of differing DPIs, is by having manually
scaled versions of every asset for every possible DPI scaling
factor. This is a bit bothersome, but it looks great! The artists can
make sure every pixel is just right, and they'll end up rendered on
the user's screen exactly how they intended. It would be really
bothersome to write all graphics layouts for each DPI scaling factor
however, but that can thankfully be generalized (sort of): just work
in some "logical" pixel coordinate space, which gets converted into
physical pixels later on.

Dun dun dunn.

## The rock in my shoe that inspired this blog
Turns out, logical pixels aren't the savior they're made up to
be. Well, they are, to a point. As long as your DPI scaling factor is
an integer, you'll be fine. Every logical pixel will correspond to
some specific physical pixel, and no shenanigans will happen that
could ruin your artist's pixel-perfect asset. But! Some systems can
set the DPI scaling to a fractional number, like Windows. I have set
my Windows to scale everything by 1.25x, because that makes text
comfortable to read on my 1440p screen, while still giving me the
working space I want on a desktop screen. But this presents a problem,
which I will demonstrate via three examples.

### Sprite with no scaling at (2, 2)
This is the normal, easy situation. The artist has drawn a 8x8 sprite,
which I then render at the logical coordinate `(2, 2)`, at a logical
resolution of `8x8`. Because there is no scaling, this results in a
nice, crisp sprite rendered at `(2, 2)`, with a resolution of `8x8`,
displaying every pixel of the sprite in all their glory.

### 1.25x scaled sprite at (0, 0)
The artist has now drawn me a 1.25x version of a sprite for my
game. The unscaled version of the sprite is `8x8`, and so the 1.25x
version is `10x10`. I render it at the logical coordinates `(0, 0)`
with the logical size `8x8` to test out that it looks good on my 1.25x
scaled screen, and voilà: I get a `10x10` (which is `8x8` scaled by
1.25x) sprite rendered at `(0, 0)` (which is `(0, 0)` scaled by
1.25x), which looks great, pixel-perfect!

### 1.25x scaled sprite at (10, 10)
Now that I have the 1.25x sprite, I decide to playtest my game a
bit. The player ends up at the logical coordinates `(10, 10)`, but
wait! The resolution of the sprite is still correct, just as it was in
the previous example, but what about the coordinates? Well, `(10, 10)`
scaled by 1.25x is `(12.5, 12.5)`.

Well.

What happens now depends on how you handle fractional physical
pixels. In my case, rendering with OpenGL and using floats to describe
the pixel coordinates, you end up with a mushed sprite that's sampling
the texture in all the wrong spots, resulting in a sprite with a bad
1px blur. But is that okay? Is that what Microsoft intended to have be
displayed when the coordinates don't match up? Or should I round the
coordinates, and occasionally end up getting weird 1px gaps between
objects that are really just 0.01 pixels apart, enough to make them
round to the different side? I don't really know, and as such I ended
up adding this as a parameter to my quad-drawing function in the
library I'm writing. On one hand, the blur could be fine, you're on a
high DPI screen anyways, so you probably won't mind a very slight
blur. But on the other hand, if you're working with very fine details,
that blur might cause havoc! I'd be interested to hear if you have
come up with a rigorous solution to this, heard of one, or just have
opinions about this.

## Comments
You can send comments on this blog to [@neon@fedi.neon.moe][fedi] on
the Fediverse, or via email to [jens@neon.moe][email].

[fedi]: https://fedi.neon.moe/neon "My fediverse account"
[email]: mailto:jens@neon.moe "My public email"
