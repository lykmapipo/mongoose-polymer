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
//
//
/**
 * @function
 * @description compute name of the owning model of the polymorphic association
 * @return {String} valid registered mongoose model name
 * @private
 */
function getMorpByModelName() {
    //this refer to the model instance context
    //
    /*jshint validthis:true*/
    return inflection.classify(inflection.singularize(this.collection.name));
}

/**
 * @function
 * @description computing owning side polymorphic attributes (i.e id and type)
 *              and join them to form valid mongoose criteria to find the model
 *              instance that owning polymorphism.  
 * @param  {String} morphName polymorphic name
 * @return {Object}           a valid mongoose criteria that can be used to find
 *                            owner instance of polymorphism
 *
 * @private
 */
function buildMorpCriteria(morphName) {
    //this refer to model instance context
    //
    /*jshint validthis:true*/
    //compute polymorphism owner model name
    var morphBy = getMorpByModelName.call(this);

    var criteria = {};

    //build polymorphism id by joining morpName and owner id
    //
    //Example of this is when you have `imageable` polymorphism,
    //then the id criteria will add imageableId into criteria
    //which use owning model instance _id as value
    criteria[morphName + 'Id'] = this._id;

    //build polymorphism type by joining morpName and owner model name
    //
    //Example of this is when you have imageable polymorphism
    //then the type criteria will add imageableType into criteria
    //which use owning model name as value
    criteria[morphName + 'Type'] = morphBy;

    return criteria;
}

//------------------------------------------------------------------------------
//morphBy patches
//------------------------------------------------------------------------------
/**
 * @function
 * @description Build polymorphism owning side model, set up required attributes
 *              and adding polymorphism owning side finders
 * @param  {String} modelName valid mongoose model name that owning this polymorphism
 * @param  {String} morphName name of the formed polymorphism
 * @public
 */
Schema.prototype.morphBy = function(modelName, morphName) {
    //check fo model name
    if (!modelName) {
        throw new Error('No model name provided');
    }

    //check for polymorphism name
    if (!morphName) {
        throw new Error('No polymorphic name provided');
    }

    //prepare polymorphism schema fields
    var fields = {};

    //prepare polymorphism id field
    var morphIdField = morphName + 'Id';
    fields[morphIdField] = {
        type: ObjectId,
        index: true
    };

    //prepare polymorphism type field
    var morphTypeField = morphName + 'Type';
    fields[morphTypeField] = {
        type: String,
        index: true
    };

    this.add(fields);

    //adding polymorphism owner finder
    this.methods[morphName] = function(callback) {
        //prepare polymorphism owner id criteria
        //
        //TODO review if this enough criteria to find
        //the owning model instance?
        //
        var criteria = {};
        criteria._id = this[morphIdField];

        //build owner finder query
        var query = mongoose.model(modelName).find(criteria);

        //if callback provided execute query immediately
        if (_.isFunction(callback)) {
            return query.exec(callback);
        }

        //otherwise return mongoose query
        else {
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