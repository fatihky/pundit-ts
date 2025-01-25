**v0.4.0**

- Require constructor class to be passed to `new PunditPolicy()`
- Removed `abstract` property from `handlesModel` and `handlesModelConstructor`. These methods now have concrete implementations.

**v0.3.0**

- Removed `can*` methods, instead, added `authorize` abstract method.

**v0.2.7**

- Added support for indicating nothing should be matched from the `PunditPolicy#filter`

**v0.2.0**

- Added support for `filter` calls on `Pundit` containers
