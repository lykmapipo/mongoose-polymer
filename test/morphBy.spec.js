'use strict';

//dependencies
var path = require('path');
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

        Photo = mongoose.model('Photo', PhotoSchema);

        done();
    });

    it('should have morphBy ability', function(done) {
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

    it('should have morphBy finder', function(done) {
        expect(new Photo()).to.respondTo('photoable');
        done();
    });

});