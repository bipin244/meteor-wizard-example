var updateId = new ReactiveVar();
Schema = {};
Schema.information = new SimpleSchema({
	username: {
		type: String,
		regEx: /^[a-z0-9A-Z_]{3,15}$/,
		unique: true,
		label: "Username",
		custom: function () {
			if(updateId.get() == undefined ){
				if(Orders.findOne({"username" :this.value})){
					return "unique";
				}
			}else{
				if(Orders.findOne({"username" :this.value, "_id": { $ne: updateId.get()._id }})){
					return "unique";
				}
			}
		}
	}
});
Schema.tesing = new SimpleSchema({
	password: {
		type: String,
		label: "Password",
		min: 6
	},
	number: {
		type: Number,
		label: "number"
	}
});
Schema.confirm = new SimpleSchema({
	color: {
        type: String,
        label: "Color",
        autoform: {
			afFieldInput: {
				type: "color"
			}
		}
	},
	email: {
		type: String,
		autoform: {
		  afFieldInput: {
			type: "email"
		  }
		}
	},
});

Schema.submit = new SimpleSchema({
	
});
Orders.attachSchema([Schema.information,Schema.tesing,Schema.confirm,Schema.submit]);
SimpleSchema.messages({
	unique: "[label] is already exit"
});

Template.basicWizard.onRendered(function() {
	Meteor.subscribe('userdata');
});
Template.basicWizard.helpers({
	steps: function() {
		return [{
			id: 'information',
			title: 'Information',
			schema: Schema.information
		},{
			id: 'tesing',
			title: 'tesing',
			schema: Schema.tesing
		},{
			id: 'confirm',
			title: 'Confirm',
			schema: Schema.confirm,
			
			
		},{
			id: 'final',
			title: 'submit',
			schema: Schema.submit,
			onSubmit: function(data, wizard) {
				var self = this;
				var extend =  _.extend(wizard.mergedData(), data);
				if(updateId.get() == undefined){
					Orders.insert(extend, function (error, result) {
						if(error){
							console.log(error);
						}else{
							wizard.clearData();
							wizard.show('information');
						}
					});
				}else{
					Orders.update({"_id":updateId.get()._id},{$set:extend},function(error, result){
						if(error){
							console.log(error);
						}else{
							wizard.clearData();
							wizard.show('information');
							$('#insertModal').modal('hide');
						}
					});
				}
			}
		}]
	},
	books: function(){
		return Orders.find();
	},rowId: function(){
		return Session.get("selectedBooksId");
	}
});

AutoForm.addHooks('confirm', {
	onSuccess: function (formType, result) {
		console.log("onSuccess");
	},
	onError: function (formType, error) {
		console.log("onError");
	}
});
Template.basicWizard.events({
	'click .open-insert-modal': function (e) {
		e.preventDefault();
		updateId.set();
		
		//{backdrop: "static"} it is use for only close button click than close
		$('#insertModal').modal({backdrop: "static"});
	},
	'click .open-update-modal': function (e) {
		e.preventDefault();
		$('#insertModal').modal('show');
		_.each(this,function(val,key){
			$("input[name='"+key+"']").val(val)
		})
		updateId.set(this);
	}
});
