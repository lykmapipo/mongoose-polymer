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
var UserSchema;
var User;

describe('Polymer morphOne', function() {

    before(function(done) {
        UserSchema = new Schema({
            name: String
        });

        UserSchema.morphOne('Photo', 'photoable');

        User = mongoose.model('User', UserSchema);

        done();
    });

    it('should have morphOne finder', function(done) {
        expect(new User()).to.respondTo('getPhoto');
        done();
    });

    it('should be able to return morphed one instance', function(done) {
        /*jshint camelcase:false*/
        var user = new User();
        var name = faker.lorem.words(1)[0];

        async
            .waterfall([
                function createMorpOne(next) {
                    user
                        .setPhoto({
                            name: name
                        })
                        .exec(function(error, photo) {

                            expect(photo.name).to.equal(name);
                            expect(photo.photoableId).to.be.eql(user._id);
                            expect(photo.photoableType).to.equal('User');

                            next(error, photo);
                        });
                },
                function getMorphOne(photo, next) {

                    user.getPhoto(next);
                }
            ], function(error, photo) {
                expect(photo).to.not.be.null;

                expect(photo.name).to.equal(name);
                expect(photo.photoableId).to.be.eql(user._id);
                expect(photo.photoableType).to.equal('User');

                done(error, photo);
            });
        /*jshint camelcase:true*/
    });

    it('should be able to set morphed one instance', function(done) {
        /*jshint camelcase:false*/
        var user = new User();
        expect(user).to.respondTo('setPhoto');

        var name = faker.lorem.words(1)[0];
        user
            .setPhoto({
                name: name
            })
            .exec(function(error, photo) {

                expect(photo.name).to.equal(name);
                expect(photo.photoableId).to.be.eql(user._id);
                expect(photo.photoableType).to.equal('User');

                done(error, photo);
            });
        /*jshint camelcase:true*/
    });


    it('should be able to remove morphed one instance', function(done) {
        /*jshint camelcase:false*/
        var user = new User();
        expect(user).to.respondTo('removePhoto');

        var name = faker.lorem.words(1)[0];

        async
            .waterfall([
                function createMorpOne(next) {
                    user
                        .setPhoto({
                            name: name
                        })
                        .exec(function(error, photo) {

                            expect(photo.name).to.equal(name);
                            expect(photo.photoableId).to.be.eql(user._id);
                            expect(photo.photoableType).to.equal('User');

                            next(error, photo);
                        });
                },
                function removeMorpOne(photo, next) {
                    user.removePhoto(next);
                }
            ], function(error, result) {
                done(error, result);
            });
        /*jshint camelcase:true*/
    });

});