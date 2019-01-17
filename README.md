# whisker-wax

mustache-ish parser, engine, compiler

This software tries to be lean, fast and composable.

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

## Overview

There are two parts to success:

 * a parser for templates in mustache syntax, creating JSON output
 * a runner that can execute JSON output from the parser

With the above parts, it is possible to both pre-compile templates as
JavaScript to have maximum performance, and dynamically load templates
as needed and execute needed on the server or client or both.

See also: http://mustache.github.io/

## Quirks

There are a few differences from standard mustache:

 * Changing delimiters is not supported; `{{=<% %>=}}` does not work
 * Lambdas will _not_ be called with the block if used for sections
 * Instead, lambdas can appear in any tag, and are evaluated runtime
 * Lambdas can have parameters, separated by spaces, passed as string

Most of these differences are a result from allowing pre-compiled JSON
format templates. Compilation requires that sections are already parsed
or otherwise the parser would still need to be around at runtime.

## Lambdas

Lambda functions are responsible for evaluating references into context
themselves. There is no way to embed spaces in the parameters.

The `this` object passed to lambda functions is the current runner
instance, which allows access to its methods. Some of them can be
regarded as API:

 * this.partial(string): resolve string as template and run it
 * this.quote(string): quote string for HTML and return it
 * this.value(string): evaluate string and return its value
 * this.write(string): write string to the current writer

Please leave the rest of the methods alone as they may change without
notice.

### Example

Template: `Hello, {{toupper user.name}}!`
Context:
```
{
  "user": { "name": "Jeff" },
  "toupper": function(path) {
    this.write(this.value(path).toUpperCase())
  }
}
```

Will produce: "Hello, JEFF!"

## Interface

### Parser

parser.js takes string and returns JSON. Its output can be used with the
runner, or stored as compiled template.

### Runnner

runner.js needs to be created with a Writer, which can be a stream.Writable
or any other object that has a write(string) method.

Runner.run executes a template and writes result to its current writer. It
takes three parameters:

 # Template is the JSON compiled template, as a JavaScript object
 # Context is the current data object to use while evaluating strings
 # Resolver is an object allowing to load partials at runtime

### Resolver

This is a caller-defined object that has one method: resolve(string).
The resolve method retrieves a template for the given string and returns
an object with the following properties: `template`, `context`, `resolver`.

All but `template` in the result is optional. Their content and purpose is
identical with the parameters that Runner.run accepts. Context allows to
introduce additional values, and the resolver property allows changing the
resolver used in partials of the resolved template.

The resolver is free in the decision of where to pull the template from,
it can be JSON.parsed from a data block, require()d from a module, or even
parsed from mustache source as desired.

## Engine

The runner engine is a stack machine that has a few opcodes which are
integers to keep the JSON compact. They are defined in parser.js as:

```
const op = {
  write: 0,
  print: 1,
  quote: 2,
  not: 3,
  section: 4,
  partial: 5
}
```

 * Write, print, and partial do the same as described in the lambda API.
 * Quote takes a property name, quotes its value for HTML and writes it.
 * Section takes a property name and parsed JSON template, and executes
   the template for each value in the property if it is an array, or once
   if it is truthy.
 * Not takes a property name and parsed JSON template, and executes
   the template if the property value is falsey.

For example, `Hello, {{toupper user.name}}!` parses to:
```
[
  [ 0, "Hello, " ],
  [ 2, "toupper user.name" ],
  [ 0, "!" ]
]
```
