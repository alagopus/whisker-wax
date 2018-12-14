# whisker-wax

mustache parser, engine, compiler

This software tries to be lean, fast and composable.

There are three parts to success:

 * a parser for templates in mustache syntax, creating JSON output
 * an engine that can execute output from the parser
 * a compiler that will create JavaScript from output of the parser

With the above parts, it is possible to both pre-compile templates
as JavaScript to have maximum performance, and dynamically load
templates as needed and execute them as needed on the server or
client or both.

See also: http://mustache.github.io/
