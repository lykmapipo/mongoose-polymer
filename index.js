'use strict';

//dependencies
var _ = require('lodash');
var inflection = require('inflection');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

//------------------------------------------------------------------------------
// polymer utilities
//------------------------------------------------------------------------------
function getMorpByModelName() {
    /*jshint validthis:true*/
    return inflection.classify(inflection.singularize(this.collection.name));
}

function buildMorpCriteria(morphName) {
    /*jshint validthis:true*/
    var morphBy = getMorpByModelName.call(this);

    var criteria = {};
    criteria[morphName + 'Id'] = this._id;
    criteria[morphName + 'Type'] = morphBy;

    return criteria;
}

//------------------------------------------------------------------------------
//add morphBy to Schema
//------------------------------------------------------------------------------
Schema.prototype.morphBy = function(modelName, morphName) {
    if (!modelName) {
        throw new Error('No model name provided');
    }

    if (!morphName) {
        throw new Error('No polymorphic name provided');
    }

    //prepare morph schema fields
    var fields = {};
    var morphIdField = morphName + 'Id';
    fields[morphIdField] = {
        type: ObjectId,
        index: true
    };

    var morphTypeField = morphName + 'Type';
    fields[morphTypeField] = {
        type: String,
        index: true
    };

    this.add(fields);

    //add morphBy finder
    this.methods[morphName] = function(callback) {
        var criteria = {};
        criteria._id = this[morphIdField];

        var query = mongoose.model(modelName).find(criteria);

        if (_.isFunction(callback)) {
            return query.exec(callback);
        } else {
            return query;
        }
    };
};

//------------------------------------------------------------------------------
//add morphOne to schema
//------------------------------------------------------------------------------
Schema.prototype.morphOne = function(modelName, morphName) {
    //add morphOne finder
    modelName = inflection.singularize(modelName);

    this.methods['get' + modelName] = function(callback) {
        var criteria = buildMorpCriteria.call(this, morphName);

        var query = mongoose.model(modelName).findOne(criteria);

        if (_.isFunction(callback)) {
            return query.exec(callback);
        } else {
            return query;
        }
    };

    //add morphOne setter
    this.methods['set' + modelName] = function(morphOne, callback) {
        var criteria = buildMorpCriteria.call(this, morphName);

        morphOne = _.extend(morphOne, criteria);

        var query = mongoose
            .model(modelName)
            .findOneAndUpdate(criteria, morphOne, {
                new: true,
                upsert: true
            });

        if (_.isFunction(callback)) {
            return query.exec(callback);
        } else {
            return query;
        }

    };

    //add morphOne remover
    this.methods['remove' + modelName] = function(callback) {
        var criteria = buildMorpCriteria.call(this, morphName);

        var query = mongoose
            .model(modelName)
            .findOneAndRemove(criteria);

        if (_.isFunction(callback)) {
            return query.exec(callback);
        } else {
            return query;
        }
    };
};


//------------------------------------------------------------------------------
//add morphMany to schema
//------------------------------------------------------------------------------
Schema.prototype.morphMany = function(modelName, morphName) {
    //add morphOne finder
    modelName = inflection.singularize(modelName);

    //add morphMany `get` one
    this.methods['get' + modelName] = function(id, callback) {
        var criteria = buildMorpCriteria.call(this, morphName);

        var query = mongoose
            .model(modelName)
            .findById(id)
            .where(criteria);

        if (_.isFunction(callback)) {
            return query.exec(callback);
        } else {
            return query;
        }
    };

    //add morphMany `get` all
    var pluralModeName = inflection.pluralize(modelName);
    this.methods['get' + pluralModeName] = function(callback) {
        var criteria = buildMorpCriteria.call(this, morphName);

        var query = mongoose
            .model(modelName)
            .find(criteria);

        if (_.isFunction(callback)) {
            return query.exec(callback);
        } else {
            return query;
        }
    };

    //add morphMany `set`
    this.methods['add' + modelName] = function(morphOne, callback) {
        var criteria = buildMorpCriteria.call(this, morphName);

        if (_.isArray(morphOne)) {
            morphOne = morphOne.map(function(morphedOne) {
                return _.extend(morphedOne, criteria);
            });
        } else {
            morphOne = _.extend(morphOne, criteria);
        }

        return mongoose
            .model(modelName)
            .create(morphOne, callback);
    };

    //add morphMany remove one
    this.methods['remove' + modelName] = function(id, callback) {
        var criteria = buildMorpCriteria.call(this, morphName);

        var query = mongoose
            .model(modelName)
            .findByIdAndRemove(id)
            .where(criteria);

        if (_.isFunction(callback)) {
            return query.exec(callback);
        } else {
            return query;
        }
    };
};