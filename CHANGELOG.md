**v0.5.0**

- Added `.filterFor` method for building filters specific for the actions.

**v0.4.2**

- Expose `PunditMatchNothing` type.

**v0.4.1**

- The model constructor passed to the `PunditPolicy` might accept arbitrary arguments. The previous implementation required model constructor to accept no arguments.

**v0.4.0**

- Require constructor class to be passed to `new PunditPolicy()`
- Removed `abstract` property from `handlesModel` and `handlesModelConstructor`. These methods now have concrete implementations.

**v0.3.0**

- Removed `can*` methods, instead, added `authorize` abstract method.

**v0.2.7**

- Added support for indicating nothing should be matched from the `PunditPolicy#filter`

**v0.2.0**

- Added support for `filter` calls on `Pundit` containers
