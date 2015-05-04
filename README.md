# mongoose-polymer (WIP)

[![Build Status](https://travis-ci.org/lykmapipo/mongoose-polymer.svg?branch=master)](https://travis-ci.org/lykmapipo/mongoose-polymer)

Polymorphic associations for [mongoose](https://github.com/Automattic/mongoose) inspired by [laravel polymorphic relations](http://laravel.com/docs/4.2/eloquent#polymorphic-relations)

## What is it
Polymorphic associations allow a model to belong to more than one other model, on a single association. For example, you might have a photo model that belongs to either a user model or an product model. 

## Installation
```sh
$ npm install --save mongoose-polymer
```

## Usage
All you have to do is to require `mongoose-polymer` after `mongoose` prior to your schema definition. This allow `mongoose-polymer` to patch `Schema` and add all required boilerplates.

```js
var mongoose = require('mongoose');
var polymer = require('mongoose-polymer');
```
## Polymorphic One-to-One
To define polymorphic `one-to-one` with `mongoose-polymer` just use `morphBy` and `morphOne` schema methods. Consider a case where a `user schema` and `product Schema` each having a `single photo`.

Example
```js
//photo schema
var PhotoSchema = new Schema({
   ... 
});
PhotoSchema.morphBy('User','photoable');
PhotoSchema.morphBy('Product','photoable');
var Photo = mongoose.model('Photo',PhotoSchema);

//user schema
var UserSchema = new Schema({
   ... 
});
UserSchema.morphOne('Photo','photoable');
var User = mongoose.model('User',UserSchema);

//product schema
var ProductSchema = new Schema({
   ... 
});
PhotoSchema.morphOne('Photo','photoable');
var Product = mongoose.model('Product',ProductSchema);
```

## Polymorphic One-to-Many
To define polymorphic `one-to-many` with `mongoose-polymer` just use `morphBy` and `morphMany` schema methods. Consider a case where a `user schema` and `product Schema` each having `multiple photos`.

Example
```js
//photo schema
var PhotoSchema = new Schema({
   ... 
});
PhotoSchema.morphBy('User','photoable');
PhotoSchema.morphBy('Product','photoable');
var Photo = mongoose.model('Photo',PhotoSchema);

//user schema
var UserSchema = new Schema({
   ... 
});
UserSchema.morphMany('Photo','photoable');
var User = mongoose.model('User',UserSchema);

//product schema
var ProductSchema = new Schema({
   ... 
});
PhotoSchema.morphMany('Photo','photoable');
var Product = mongoose.model('Product',ProductSchema);
```

## API

### `morphBy(modelName,morphName)`
Specifies the owning model of polymorphism. In case of `Product` and `Photo` the owning model is `Product`. `modelName` is valid model name of the owning side and `morpName` is the name of polymorphic association formed. `morpName` controls the name of fields used to store the formed association.

Example
```js
PhotoSchema.morphBy('Product','photoable');
...
```

### `morpOne(modelName,morphName)`
Specifies the owned model in one-to-one polymorphism. In case of `Product` and `Photo` the owned model is `Photo`. `modelName` is valid model name of the owned side and `morpName` is the name of polymorphic association formed. `morpName` controls the name of fields used to store the formed association.

Example
```js
//one-to-one
PhotoSchema.morphOne('Photo','photoable');
...


### `morpMany(modelName,morphName)`
Specifies the owned model in one-to-many polymorphism. In case of `Product` and `Photo` the owned model is `Photo`. `modelName` is valid model name of the owned side and `morpName` is the name of polymorphic association formed. `morpName` controls the name of fields used to store the formed association.

Example
```js
//one-to-many
PhotoSchema.morphMany('Photo','photoable');
...
```


## Testing
* Clone this repository

* Install all development dependencies
```sh
$ npm install
```
* Then run test
```sh
$ npm test
```

## Contribute
It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.


## Licence
The MIT License (MIT)

Copyright (c) 2015 lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 