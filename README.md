# mongoose-polymer

[![Build Status](https://travis-ci.org/lykmapipo/mongoose-polymer.svg?branch=master)](https://travis-ci.org/lykmapipo/mongoose-polymer)

Polymorphic associations for [mongoose](https://github.com/Automattic/mongoose) inspired by [laravel polymorphic relations](http://laravel.com/docs/4.2/eloquent#polymorphic-relations) and others.

## What is it
`mongoose-polymer` and thus polymorphic associations, allow a model to belong to more than one other model on a single association. For example, you might have a photo model that belongs to either a user model or an product model. 

## Installation
```sh
$ npm install --save mongoose-polymer
```

## Usage
Require `mongoose-polymer` after `mongoose` prior to your schema definition. This allows `mongoose-polymer` to patch `Schema` and add all required polymorphism boilerplates.

```js
var mongoose = require('mongoose');
var polymer = require('mongoose-polymer');
```

## Polymorphic One-to-One
To define polymorphic `one-to-one` with `mongoose-polymer`, use [morphBy](#morphbymodelnamemorphname)  schema method on the owned model side and [morphOne](#morponemodelnamemorphname) schema method on the owning model side. Consider a case where a `user schema` and `product schema` each having a `single photo`. Here `user schema` and `product schema` form the owning side(or parent) and `photo schema` is the owned side(or child).

Example
```js
//photo schema defenition
var PhotoSchema = new Schema({
   ... 
});
PhotoSchema.morphBy('User','photoable');
PhotoSchema.morphBy('Product','photoable');
var Photo = mongoose.model('Photo',PhotoSchema);

//user schema definition
var UserSchema = new Schema({
   ... 
});
UserSchema.morphOne('Photo','photoable');
var User = mongoose.model('User',UserSchema);

//product schema definition
var ProductSchema = new Schema({
   ... 
});
PhotoSchema.morphOne('Photo','photoable');
var Product = mongoose.model('Product',ProductSchema);

//samples
//adding user photo
user
    .setPhoto({name:'user photo'})
    .exec(function(error,photo){
        ...
    });

//get user photo
user
    .getPhoto(function(error,photo){
        ...
    });

//removing user photo
user
    .removePhoto(function(error,photo){
        ...
    });

//get photo user
photo
    .photoable(function(error,user){
        ...    
    });
```

## Polymorphic One-to-Many
To define polymorphic `one-to-many` with `mongoose-polymer`, use [morphBy](#morphbymodelnamemorphname) schema method on the owned model side and [morphMany](#morphmanymodelnamemorphname) schema method method in the owning model side. Consider a case where a `user schema` and `product schema` each having `multiple photo`. Here `user schema` and `product schema` form the owning side(or parent) and `photo schema` is the owned side(or child).


Example
```js
//photo schema definition
var PhotoSchema = new Schema({
   ... 
});
PhotoSchema.morphBy('User','photoable');
PhotoSchema.morphBy('Product','photoable');
var Photo = mongoose.model('Photo',PhotoSchema);

//user schema definition
var UserSchema = new Schema({
   ... 
});
UserSchema.morphMany('Photo','photoable');
var User = mongoose.model('User',UserSchema);

//product schema definition
var ProductSchema = new Schema({
   ... 
});
PhotoSchema.morphMany('Photo','photoable');
var Product = mongoose.model('Product',ProductSchema);

//samples
//add user photo
user
    .addPhoto({name:'user photo'})
    .exec(function(error,photo){
        ...
    });

//add user photos
user
    .addPhoto([{name:'first photo'},{name:'second phot'}])
    .exec(function(error,photos){
        ...
    });

//get all user photos
user
    .getPhotos()
    .exec(function(error,photos){
        ...
    });

//get one user photo
user
    .getPhoto(photoId)
    .exec(function(error,photo){
        ...    
    });

//remove all user photos
user
    .removePhotos()
    .exec(function(error,photos){
        ...
    });

//remove one user photo
user
    .removePhoto(photoId)
    exec(function(error,photo){
        ...
    });
```

## API

### `morphBy(modelName,morphName)`
Specifies the owning model of polymorphism. In case of `Product` and `Photo` the owning model is `Product`. `modelName` is valid model name of the owning side and `morpName` is the name of polymorphic association formed. `morpName` controls the name of fields used to store the formed association.

Example
```js
PhotoSchema.morphBy('Product','photoable');
...
```

Following model instance methods will be added to the owned model instance

#### `morphName(callback)`
An instance method whose name is determines by `morphName` will be added to owned side model instance to enable retrieving owning side model instance. For the above cases `Photo` model instance will gain `photoable` instance method to enable it to retrieve either `Product` or `User` instance.

Example
```js
//when want to retrieve user from photo instance
photo
    .photoable(function(error,user){
        ...
    });

//when want to retrieve product from photo instance
photo
    .photoable(function(error,product){
        ...
    });
```

### `morphOne(modelName,morphName)`
Specifies the owned model in one-to-one polymorphism. In case of `Product` and `Photo` the owned model is `Photo`. `modelName` is valid model name of the owned side and `morpName` is the name of polymorphic association formed. `morpName` controls mongoose criteria building in the owning side.

Example
```js
//one-to-one
PhotoSchema.morphOne('Photo','photoable');
...
```

The following model instance methods will be added on owning model instance

#### `getModelName(callback)`
Additional instance method whose name is determined by the name of the owned model, will be added to the owning model to enable it to retrieve its polymer. For the case of the above examples `User` and `Product` model instance will have instance method with name `getPhoto` to enable them to get their photo. If `callback` is not supplied `valid mongoose query` will be returned to allow additional chaining.

Example
```js
//when retrieving photo instance from the user instance
user
    .getPhoto()
    //more conditions
    .exec(function(error,photo){
        ...
    });
```


#### `setModelName(morphOne,callback)`
Additional instance method whose name is determined by the name of the owned model, will be added to the owning model to enable it to set its polymer. For the case of the above examples `User` and `Product` model instance will have instance method with name `setPhoto` to enable them to get their photo. If `callback` is not supplied `valid mongoose query` will be returned to allow additional chaining.

Example
```js
//when set photo instance for the user instance
user
    .setPhoto({name:'mongoose-polymer'})
    .exec(function(error,photo){
        ...
    });
```

#### `removeModelName(callback)`
Additional instance method whose name is determined by the name of the owned model, will be added to the owning model to enable it to remove its polymer. For the case of the above examples `User` and `Product` model instance will have instance method with name `removePhoto` to enable them to remove their photo. If `callback` is not supplied `valid mongoose query` will be returned to allow additional chaining.

Example
```js
//when removing photo instance from the user instance
user
    .removePhoto()
    //more conditions
    .exec(function(error,photo){
        ...
    });
```


### `morphMany(modelName,morphName)`
Specifies the owned model in one-to-many polymorphism. In case of `Product` and `Photo` the owned model is `Photo`. `modelName` is valid model name of the owned side and `morpName` is the name of polymorphic association formed. `morpName` controls mongoose criteria building in the owning side.

Example
```js
//one-to-many
PhotoSchema.morphMany('Photo','photoable');
...
```

The following model instance methods will be added to the owning model instance

#### `getModelName(id,callback)`
Additional instance method whose name is determined by the name of the owned model, will be added to the owning model to enable it to get one of its polymer. For the case of the above examples `User` and `Product` model instance will have instance method with name `getPhoto` to enable them to retrieve one of  their photo. If `callback` is not supplied `valid mongoose query` will be returned to allow additional chaining.

Example
```js
//when retrieving one photo instance from the user instance
user
    .getPhoto(_id)
    //more conditions
    .exec(function(error,photo){
        ...
    });
```

#### `getModelNames(callback)`
Additional instance method whose name is determined by pluralizing the name of the owned model, will be added to the owning model to enable it to get all of its polymer. For the case of the above examples `User` and `Product` model instance will have instance method with name `getPhotos` to enable them to retrieve all their photos. If `callback` is not supplied `valid mongoose query` will be returned to allow additional chaining.

Example
```js
//when retrieving all photos instance from the user instance
user
    .getPhotos()
    //more conditions
    .exec(function(error,photos){
        ...
    });
```

#### `addModelName(morphOne,callback)`
Additional instance method whose name is determined by the name of the owned model, will be added to the owning model to enable it to add one or more polymer. For the case of the above examples `User` and `Product` model instance will have instance method with name `addPhoto` to enable them to add one or more photo. If `callback` is not supplied `mongoose promise` will be returned for evaluation.

Example
```js
//when adding one photo instance from the user instance
user
    .addPhoto({name:'photo name'})
    .then(function(error,photo){
        ...
    });

//when adding multiple photos instance from the user instance
user
    .addPhoto([{name:'photo name'},{name:'another photo'}])
    .then(function(error,photo){
        ...
    });
```

#### `removeModelName(id,callback)`
Additional instance method whose name is determined by the name of the owned model, will be added to the owning model to enable it to remove one of its polymer. For the case of the above examples `User` and `Product` model instance will have instance method with name `removePhoto` to enable them to remove one of their photo. If `callback` is not supplied `valid mongoose query` will be returned to allow additional chaining.

Example
```js
//when removing one of the photo instance from the user instance
user
    .removePhoto(_id)
    //more conditions
    .exec(function(error,photo){
        ...
    });
```

#### `removeModelNames(callback)`
Additional instance method whose name is determined by pluralizing the name of the owned model, will be added to the owning model to enable it to remove its polymers. For the case of the above examples `User` and `Product` model instance will have instance method with name `removePhotos` to enable them to remove their photos. If `callback` is not supplied `valid mongoose query` will be returned to allow additional chaining.

Example
```js
//when removing photos instance from the user instance
user
    .removePhotos()
    //more conditions
    .exec(function(error,photo){
        ...
    });
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