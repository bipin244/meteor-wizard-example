Orders.allow({
	insert: function() {
		return true; 
	},
	update: function() {
		return true; 
	},
	remove: function() {
		return true;
	}
});
Meteor.methods({
	accountsIsUsernameAvailable: function(username) {
		console.log(username);
		if(Orders.findOne({username:username})){
			return true;
		}else{
			return false;
		}
	}
});

