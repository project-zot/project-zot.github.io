# Developing New Extensions

> :point_right: You can add new functionality to the zot registry by developing *extensions* for integration into zot.

The OCI Distribution Specification supports extending the functionality of an OCI-compliant registry implementation by adding *extensions*. Extensions are new APIs developed outside of the core OCI specs. Developers may propose their extensions to the OCI for possible future addition to the Distribution Specification.

:pencil2: When planning the development of a new extension, be sure to familiarize yourself with the [OCI documentation and guidelines for extensions](https://github.com/opencontainers/distribution-spec/tree/main/extensions).


## Current extensions

The following extensions are currently available in the zot project: 

- metrics
- sync
- search
- scrub
- lint

You can examine the implementation of these extensions in the zot project [extensions section](https://github.com/project-zot/zot/tree/main/pkg/extensions). The operation and configuration of the current extensions is described in [Configuring zot](../admin-guide/admin-configuration.md).


## Guidelines for developing new extensions

* Each file to be included in the binary for only a specific extension must contain the following syntax at the beginning of the file. For example, a file to be included in the build for extension *foo* must begin with the following lines:


        //go:build foo
        // +build foo

        package foo
   
        ...

    * The first line (`//go:build foo`) is added automatically by the linter if not already present.

    * The second line and the third (blank) line are mandatory.

- For each file that contains functions specific to the extension, create a corresponding "no-op" file that contains exactly the same function names. In this file:
 
    - Each function is a "no-op," performing no action other than to return a "success" value if expected.
    - We recommend naming this "no-op" file by appending `-disabled` to the name of the original file. For example, if the extension is implemented by `extension-foo.go`, the corresponding "no-op" file could be named `extension-foo-disabled.go`.
    - The first two lines declare an "anti-tag" (for example, `!foo`). In the *foo* extension example, the "no-op" file will be included in binaries that don't implement the *foo* extension, but won't be included in binaries that implement the *foo* extension.  The *foo* example "no-op" file begins with the following lines:

      ~~~go
        //go:build !foo
        // +build !foo

        package foo
    
        ...
      ~~~

    See extension [lint-disabled.go](https://github.com/project-zot/zot/blob/main/pkg/extensions/lint/lint_disabled.go) in the zot project for an example of a "no-op" file.

- When developing a new extension, you should create a blackbox test in which a binary containing the new extension can be tested in a usage scenario. See the [test/blackbox](https://github.com/project-zot/zot/tree/main/test/blackbox) folder in the zot project for examples of extension tests.

    - Create targets in `Makefile` for newly added blackbox tests. You should also add them as GitHub Workflows in [.github/workflows/ecosystem-tools.yaml](https://github.com/project-zot/zot/blob/main/.github/workflows/ecosystem-tools.yaml) in the zot project.

- When configuring multiple extensions in the `extensions` section of the zot configuration file, list new extensions after the current extensions in the recommended order, such as:

    metrics, sync, search, scrub, lint, _new_extension_1_, _new_extension_2_, ...

## Building zot with extensions

When you build the full zot image (for example, `make binary`), all extensions listed in the **EXTENSIONS** variable in `Makefile` are included in the build. When you've created a new extension, you must modify the **EXTENSIONS** variable in `Makefile` by adding the new extension. 

To build an image with only selected extensions, you can specify the desired extensions by declaring them in the build command:

    make binary EXTENSIONS=extension1,extension2,extension3...

For example, to build with only sync and scrub, the command would be:

    make binary EXTENSIONS=sync,scrub
