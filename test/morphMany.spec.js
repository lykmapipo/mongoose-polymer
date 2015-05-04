'use strict';

//dependencies
var faker = require('faker');
var async = require('async');
var path = require('path');
var expect = require('chai').expect;
var mongoose = require('mongoose');
//load polymer
require(path.join(__dirname, '..', 'index'));
var Schema = mongoose.Schema;
var ProductSchema;
var Product;

describe('Polymer morphMany', function() {

    before(function(done) {
        ProductSchema = new Schema({
            name: String
        });

        ProductSchema.morphMany('Photo', 'photoable');

        Product = mongoose.model('Product', ProductSchema);

        done();
    });

    it('should be able to return morphed one instance', function(done) {
        /*jshint camelcase:false*/
        var user = new Product();
        var name = faker.lorem.words(1)[0];

        expect(user).to.respondTo('getPhoto');

        async
            .waterfall([
                function createMorpMany(next) {
                    user
                        .setPhoto({
                            name: name
                        }, function(error, photo) {

                            expect(photo.name).to.equal(name);
                            expect(photo.photoableId).to.be.eql(user._id);
                            expect(photo.photoableType).to.be.equal('Product');

                            next(error, photo);
                        });
                },
                function getMorphOne(photo, next) {

                    user.getPhoto(photo._id, next);
                }
            ], function(error, photo) {
                expect(photo).to.not.be.null;

                expect(photo.name).to.be.equal(name);
                expect(photo.photoableId).to.be.eql(user._id);
                expect(photo.photoableType).to.be.equal('Product');

                done(error, photo);
            });
        /*jshint camelcase:true*/
    });

    it('should be able to add morphed one instance', function(done) {
        /*jshint camelcase:false*/
        var user = new Product();
        expect(user).to.respondTo('setPhoto');

        var name = faker.lorem.words(1)[0];
        user
            .setPhoto({
                name: name
            }, function(error, photo) {

                expect(photo.name).to.be.equal(name);
                expect(photo.photoableId).to.be.eql(user._id);
                expect(photo.photoableType).to.be.equal('Product');

                done(error, photo);
            });
        /*jshint camelcase:true*/
    });


    it('should be able to remove morphed one instance', function(done) {
        /*jshint camelcase:false*/
        var user = new Product();
        expect(user).to.respondTo('removePhoto');

        var name = faker.lorem.words(1)[0];

        async
            .waterfall([
                function createMorpMany(next) {
                    user
                        .setPhoto({
                            name: name
                        }, function(error, photo) {

                            expect(photo.name).to.be.equal(name);
                            expect(photo.photoableId).to.be.eql(user._id);
                            expect(photo.photoableType).to.be.equal('Product');

                            next(error, photo);
                        });
                },
                function removeMorpOne(photo, next) {
                    user.removePhoto(photo._id, next);
                }
            ], function(error, result) {
                done(error, result);
            });
        /*jshint camelcase:true*/
    });

    it('should be able to add morphed many instance', function(done) {
        /*jshint camelcase:false*/
        var user = new Product();
        expect(user).to.respondTo('setPhoto');

        user
            .setPhoto([{
                name: faker.lorem.words(1)[0]
            }, {
                name: faker.lorem.words(1)[0]
            }], function(error, photos) {

                expect(photos).to.not.be.null;
                expect(photos.length).to.be.equal(2);

                done(error, photos);
            });
        /*jshint camelcase:true*/
    });

    it('should be able to get morphed many instance', function(done) {
        /*jshint camelcase:false*/
        var user = new Product();
        expect(user).to.respondTo('getPhotos');

        async.waterfall([
            function createMorpMany(next) {
                user
                    .setPhoto([{
                        name: faker.lorem.words(1)[0]
                    }, {
                        name: faker.lorem.words(1)[0]
                    }], next);
            },
            function findMorpMany(photos, next) {
                user.getPhotos(next);
            }
        ], function(error, photos) {
            expect(photos).to.not.be.null;
            expect(photos.length).to.be.equal(2);

            done(error, photos);
        });
        /*jshint camelcase:true*/
    });

});