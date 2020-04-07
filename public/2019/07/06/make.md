## My experience learning make
When I have been looking for a new language to learn, or gauging the
usefulness of a language, I tend to appreciate build systems as part
of the language. I think an important property of a tool is its
simplicity of use, and for a long time I avoided C because it did not
have a `mvn`, `cargo`, or `npm`. I thought the lack of an in-built
build tool made C unnecessarily complicated to get started with. After
reading bits and pieces of the K&R, making an almost whole game in C,
and still not having touched makefiles, I have come to the conclusion
that I was wrong. I have been happily writing C and building it with
shell-scripts that build the program for each specific system. For
example, I have a batch script for Windows that builds the program
with `cl.exe`, providing the correct flags, one for Linux, and so on.

The reason I wrote the shell scripts instead of makefiles is because I
already knew how shell scripts work, and learning to use `cc` and
`cl.exe` was quite similar to learning to use the aforementioned build
tools. If the compilers did not do something I needed from a build
tool, I would just write that part in the script myself. In addition
to this, I have heard a lot about makefiles not being super portable,
and the existence of `qmake` and `cmake` seem to prove that idea. And
in my own experience, when I have had to call `make` manually, it has
stumbled on my system being misconfigured somehow, which makes it seem
prone to breakage.

That said, I definitely feel like I should learn how to write a
`Makefile`, if for no other reason than to make my negative opinion of
them more valid. Or invalid, as the case may be ;)

### Learning make
A few days ago, I got a copy of The Unix Programming Environment by
Brian W. Kernighan and Rob Pike from the library. Why? The main reason
was because I wanted to explore the Unix philosophy a bit further than
what I had learned from hearing it repeatedly in tech articles and
social media (not much). The other reason was because I imagined it
would have a bit on `make`.

It does, sort-of. The eighth chapter is about writing a big program,
and has three digressions on `make`. Based on that, I got the
following impression of it: makefiles define dependencies between
generated and manually edited files, and how those dependencies
manifest (that is, how you get from the manually written files to the
generated ones). The connection to C becomes obvious once you think
about C programming in those terms: first you manually edit the C
source code, then you generate object files out of that, and then you
generate a final executable from those.

In this light, `make` seems like an obvious fit for C, but very
general as well. I did not realize what the specific role of `make`
was before, probably because other programming languages have built
similar functionality into their build tools, but after this
realization, it is obvious.

On one hand, I appreciate how `cc` and `make` split the job of making
lots of source code into an executable (something something Unix
philosophy), but on the other hand, I can not help but feel like it is
pointlessly complicated for the end-user. Almost every program follows
a similar build-pipeline, or could at least be refactored to fit, so
why not combine the functionalities to a singular build tool? Why do I
need to learn yet another syntax just to build my C? I imagine that is
what a lot of people thought, since at least a few trillion different
tools have been written to build a C program. I think. `Ninja` just
sounds so out-there, that all the good names must have been taken
already, which would infer many such tools. I do not actually know if
`ninja` is a build tool. But I digress.

### Conclusion
`Make(1)` is neat. I wrote a `Makefile` for this blog to test it out,
and I enjoyed the experience after ironing out a few
misunderstandings. It is a shame that `make` is the most universal
tool to build C programs, I would much prefer a more `cargo`/`go
build`-like experience, but it is not that bad either. If you are of a
similar mindset to mine at the beginning of this post, just go ahead
and use `make`. It is not evil. At the very least, it can not be as
bad as picking one of the million other C build tools, because you do
not get anywhere by making [yet another standard][xkcd], and you learn
a new tool you can use for many other things as well. And make sure to
be [POSIX-compatible][posix-make], just to be a good citizen :)

As a final note, The Unix Programming Environment has been a pretty
fun read, if a bit obsolete. At least the C is, did you know functions
looked like this in the 1970s?

```c
main(argc, argv)
        char *argv[];
{
    // ...
}
```

### Unimportant meta footnote you can skip
This is my first techblog, and I hope it was bearable to read. I think
my English is a bit clumsy in long-form, so if you have got any
writing tips, or just comments on this blog overall, be sure to shoot
them at [@neon@fedi.neon.moe][fedi] on the Fediverse, or via email to
[jens@neon.moe][email].

<script src="/codehighlighter.min.js" type="text/javascript"></script>

[xkcd]: https://xkcd.com/927/ "Yeah, it is that one xkcd everyone always posts."
[posix-make]: http://pubs.opengroup.org/onlinepubs/9699919799/utilities/make.html
[fedi]: https://fedi.neon.moe/neon
[email]: mailto:jens@neon.moe
