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
//morphBy schema patches
//------------------------------------------------------------------------------
//
//
/**
 * @function
 * @description Build polymorphism owning side model, set up required attributes
 *              and adding polymorphism owning side finders
 * @param  {String} modelName valid mongoose model name that owning this polymorphism
 * @param  {String} morphName name of the formed polymorphism
 * @public
 */
Schema.prototype.morphBy = function(modelName, morphName) {
    //this refer to the schema instance context
    //
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
        //this refer to the model instance context

        //prepare polymorphism owner id criteria
        //
        //TODO review if this enough criteria to find
        //the owning model instance?
        //
        var criteria = {};
        criteria._id = this[morphIdField];

        //build owner finder query
        var query = mongoose.model(modelName).findOne(criteria);

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
//morphOne schema patches
//------------------------------------------------------------------------------
//
//
/**
 * @function
 * @description Adding set, get and remove owned polymer in polymorphism owning 
 *              model instance
 * @param  {String} modelName valid mongoose model name that is owned in this 
 *                            polymorphism
 * @param  {String} morphName name of the formed polymorphism
 * @public
 */
Schema.prototype.morphOne = function(modelName, morphName) {
    //this refer to the schema instance context

    //singularize owner model if user gave a plural model name
    modelName = inflection.singularize(modelName);

    //adding getter to get owned model instance.
    this.methods['get' + modelName] = function(callback) {
        //this refer to the model instance context

        //prepare criteria to get the owning model
        var criteria = buildMorpCriteria.call(this, morphName);

        //query for a single model since we are using morpOne
        //polymorphism type
        var query = mongoose.model(modelName).findOne(criteria);

        //if callback is provided execute query immediately
        if (_.isFunction(callback)) {
            return query.exec(callback);
        }

        //otherwise return mongoose query
        else {
            return query;
        }
    };

    //adding setter to set owned model
    this.methods['set' + modelName] = function(morphOne, callback) {
        //this refer to the model instance context

        //prepare owning model criteria
        var criteria = buildMorpCriteria.call(this, morphName);

        //prepare data to upsert or update
        morphOne = _.extend(morphOne, criteria);

        //find owned model instance
        //if not exist create one and return it
        //otherwise update it and return updated model
        var query = mongoose
            .model(modelName)
            .findOneAndUpdate(criteria, morphOne, {
                new: true,
                upsert: true
            });

        //if callback provided execute query immediately
        if (_.isFunction(callback)) {
            return query.exec(callback);
        }

        //othewise return mongoose query
        else {
            return query;
        }

    };

    //adding owned model remover
    this.methods['remove' + modelName] = function(callback) {
        //this refer to the model instance context

        //prepare owning model criteria
        var criteria = buildMorpCriteria.call(this, morphName);

        //create owned model remove query
        var query = mongoose
            .model(modelName)
            .findOneAndRemove(criteria);

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
//morphMany schema patches
//------------------------------------------------------------------------------
//
//
/**
 * @function
 * @description Adding add, get and remove owned polymer in polymorphism owning 
 *              model instance
 * @param  {String} modelName valid mongoose model name that is owned in this 
 *                            polymorphism
 * @param  {String} morphName name of the formed polymorphism
 * @public
 */
Schema.prototype.morphMany = function(modelName, morphName) {
    //this refer to the schema instance context

    //get singular form of the owned model name
    //in case plural form was provided
    modelName = inflection.singularize(modelName);

    //add get one owned model of this polymorpism
    this.methods['get' + modelName] = function(id, callback) {
        //this refer to the owning model instance context

        //build owning model find criterias
        var criteria = buildMorpCriteria.call(this, morphName);

        //query one of owned model
        //using provided id
        var query = mongoose
            .model(modelName)
            .findById(id)
            .where(criteria);

        //if callback provide execute query immediately
        if (_.isFunction(callback)) {
            return query.exec(callback);
        }

        //otherwise return mongoose query
        else {
            return query;
        }
    };

    //add `get` all owned model
    var pluralModeName = inflection.pluralize(modelName);
    this.methods['get' + pluralModeName] = function(callback) {
        //this refer to the owning model instance context

        //prepare owning model find criteria
        var criteria = buildMorpCriteria.call(this, morphName);

        //find all owned model
        var query = mongoose
            .model(modelName)
            .find(criteria);

        //if callback provided execute query immediately
        if (_.isFunction(callback)) {
            return query.exec(callback);
        }

        //otherwise return mongoose query
        else {
            return query;
        }
    };

    //add owned model `add`er to allow to add owned
    //model instance to the owning model
    this.methods['add' + modelName] = function(morphOne, callback) {
        //this refer to the owning model instance context

        //prepare owning model find criteria
        var criteria = buildMorpCriteria.call(this, morphName);

        //if more than one owned model need to be added
        //prepare them
        if (_.isArray(morphOne)) {
            morphOne = morphOne.map(function(morphedOne) {
                return _.extend(morphedOne, criteria);
            });
        }
        //it just a single owned model we want to add 
        else {
            morphOne = _.extend(morphOne, criteria);
        }

        //if callback provided execute query
        //otherwise return the promise/deferer
        return mongoose
            .model(modelName)
            .create(morphOne, callback);
    };

    //add owned model remover
    this.methods['remove' + modelName] = function(id, callback) {
        //this refer to the owning model context

        //prepare owning model find criteria
        var criteria = buildMorpCriteria.call(this, morphName);

        //find and remove owned model
        //of the given id
        var query = mongoose
            .model(modelName)
            .findByIdAndRemove(id)
            .where(criteria);


        //if callback provided execute query immediately
        if (_.isFunction(callback)) {
            return query.exec(callback);
        }

        //otherwise return mongoose query
        else {
            return query;
        }
    };

    //add all owned model remover
    this.methods['remove' + pluralModeName] = function(callback) {
        //this refer to the owning model context

        //prepare owning model find criteria
        var criteria = buildMorpCriteria.call(this, morphName);

        //find and remove all owned model
        var query = mongoose
            .model(modelName)
            .remove(criteria);


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