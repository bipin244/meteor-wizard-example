var updateId = new ReactiveVar();
var backData = new ReactiveVar();

var saveAllBackData = {};
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
	},password: {
		type: String,
		label: "Password",
		min: 6,
		autoform: {
			afFieldInput: {
				type: "password"
			}
		}
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

Orders.attachSchema([Schema.information,Schema.confirm]);
SimpleSchema.messages({
	unique: "[label] is already exit"
});

Template.Confirm.onRendered(function() {
	var test = backData.get();
	if(test != undefined){
		if(test['confirm'] != undefined){
			_.each(test['confirm'],function(val,key){
				$("input[name='"+key+"']").val(val)
			})
		}else{
			_.each(test,function(val,key){
				$("input[name='"+key+"']").val(val)
			})
		}	
	}
});
Template.information.onRendered(function() {
	_.each(backData.get(),function(val,key){
		$("input[name='"+key+"']").val(val)
	})
});
Template.basicWizard.onRendered(function() {
	Meteor.subscribe('userdata');
});
Template.basicWizard.helpers({
	steps: function() {
		return [{
			id: 'information',
			title: 'Information',
			template:'information',
			schema: Schema.information
		},{
			id: 'confirm',
			title: 'Confirm',
			template: 'Confirm',
			schema: Schema.confirm,
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
	},
	onError: function () {
		return function (error) { alert(error); };
    },
    onSuccess: function () {
		return function (result) { alert("Successfully Deleted!"); };
    },
    beforeRemove: function () {
		return function (People, id) {
			var doc = People.findOne(id);
			if (confirm('Are You Sure you Want to delete USERNAME :"' + doc.username + '" data?')) {
				this.remove();
			}
			
		};
	}
});
AutoForm.debug =true;
AutoForm.addHooks('orderWizard', {
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
		backData.set(this);
		_.each(this,function(val,key){
			$("input[name='"+key+"']").val(val)
		})
		updateId.set(this);
	}
});
Template.wizardButtons2.helpers({
	showBackButton: function() {
		return this.backButton && !this.isFirstStep()
	}
})
Template.wizardButtons2.events({
	'click .wizard-back-button': function(e) {
		saveAllBackData[this.activeStep(false).id]=AutoForm.getFormValues('confirm-form').insertDoc;
		backData.set(saveAllBackData);
		this.previous();
	}
})
