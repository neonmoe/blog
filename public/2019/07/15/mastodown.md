## Putting my Mastodon to sleep
Not my pet of the genus Mammut, no. Just my old fediverse
instance. Sometimes you want to move domains, sometimes software. Of
course, you could migrate your old instance over to the new software,
but what if there is no migration path, or you'd like to start anew?
This is the situation that inspired this post\: I moved to Pleroma
when they finally released 1.0, and started a new instance on another
subdomain, on my own hardware. I would like to avoid paying for my
Mastodon instance's server costs now that I am not using it anymore.

Disclaimer: I have not contributed to any fediverse software,
and I have no idea about how they really work. My fedi experience
consists of hosting an instance for two years. So, consume this
document with much salt.

You may ask, how do you put an extinct proboscidean to sleep? I do not
know either, so I asked on the fedi, but nobody came up with a solid
battle-plan. After some searching, I found the `tootctl self-destruct`
command, which seems like a good way to make everyone forget your
server ever existed (it sends account delete activities to
everyone). That is not quite the magnitude I want, I would prefer to
leave a gravestone, not absolutely annihilate my old persona. But hey,
that might be what you want, so there you go.

<em class="comment">Imagine a few hours of system administration
before reading onwards, that's what I did at this point in the blog. I
do so enjoy writing an article as I do the stuff I write about.</em>

Based on the previous information, I had a plan to cache the
`/users/neon` endpoint, and respond with error 410 everywhere else. I
did that, and then realized that it probably is not good to pretend to
be an active instance (through providing a cached response on one
endpoint), and ended up just serving 410 on the whole domain.

So, how do you put a big furry creature to sleep? Make it respond to
everything with error 410. That's what I did in any case, I hope it's
asleep now.
