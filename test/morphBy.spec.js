'use strict';

//dependencies
var path = require('path');
var faker = require('faker');
var async = require('async');
var expect = require('chai').expect;
var mongoose = require('mongoose');
//load polymer
require(path.join(__dirname, '..', 'index'));
var Schema = mongoose.Schema;
var PhotoSchema;
var Photo;

describe('Polymer morphBy', function() {

    before(function(done) {
        PhotoSchema = new Schema({
            name: String
        });

        PhotoSchema.morphBy('User', 'photoable');
        PhotoSchema.morphBy('Passport', 'photoable');

        Photo = mongoose.model('Photo', PhotoSchema);

        done();
    });

    it('should be able to morph', function(done) {
        expect(PhotoSchema).to.respondTo('morphBy');
        done();
    });

    it('should be able to extend a schema with morphBy properties', function(done) {
        /*jshint camelcase:false*/
        expect(PhotoSchema.paths.photoableId).to.exist;
        expect(PhotoSchema.paths.photoableId.instance).to.be.equal('ObjectID');
        expect(PhotoSchema.paths.photoableId._index).to.be.true;

        expect(PhotoSchema.paths.photoableType).to.exist;
        expect(PhotoSchema.paths.photoableType.instance).to.be.equal('String');
        expect(PhotoSchema.paths.photoableType._index).to.be.true;
        /*jshint camelcase:true*/

        done();
    });

    it('should be able to find owning model instance', function(done) {
        /*jshint camelcase:false*/
        var PassportSchema = new Schema({
            owner: String
        });
        PassportSchema.morphOne('Photo', 'photoable');
        var Passport = mongoose.model('Passport', PassportSchema);

        expect(new Photo()).to.respondTo('photoable');

        var _passport;
        var photoName = faker.lorem.words(1)[0];

        async
            .waterfall(
                [
                    function createPassport(next) {
                        Passport
                            .create({
                                owner: faker.lorem.words(1)[0]
                            }, next);
                    },
                    function setPassoprtPhoto(passport, next) {
                        _passport = passport;

                        passport
                            .setPhoto({
                                name: photoName
                            })
                            .exec(function(error, photo) {

                                expect(photo.name).to.equal(photoName);
                                expect(photo.photoableId).to.be.eql(passport._id);
                                expect(photo.photoableType).to.equal('Passport');

                                next(error, photo);
                            });
                    },
                    function getPhotoPassport(photo, next) {
                        photo.photoable(next);
                    }
                ],
                function(error, passport) {
                    expect(passport).to.not.be.null;
                    expect(passport.collection.name).to.be.equal('passports');

                    expect(passport.owner).to.equal(_passport.owner);
                    expect(passport._id).to.be.eql(passport._id);

                    done(error, passport);
                });
        /*jshint camelcase:true*/
    });

});