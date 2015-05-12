// to depend on a bower installed component:
// define(['component/componentName/file'])

var console = console;

define(["jquery", "knockout"], function($, ko) {

	$.getScript("http://netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js");

	var subjects =[];

	var Subject = function (item) {
		var self     = this;
		self.id      = item.id;
		self.name    = item.name;
		self.kredit  = item.kredit;
		self.kreditText = ko.computed(function(){
			return self.kredit + " kredit";
		});
		self.level   = item.level;
		self.parents = ko.observableArray([]);
		self.done    = ko.observable(false);
		self.cando   = ko.computed(function(){
			var p = self.parents();
			for(var i = 0, l = p.length; i < l; i++){
				if(!p[i].done()){
					self.done(false);
					return false;
				}
			}
			return true;
		});
		self.toggle = function(){
			if(self.cando()){
				self.done(!self.done());
			}else{
				self.done(false);
			}
		};
		self.highlight = ko.computed(function(){
			return self.cando() && !self.done();
		});
		self.nochild = ko.computed(function(){
			return false;
		});
	};

	var Level = function(){
		var self        = this;
		self.subjects   = ko.observableArray([]);
	};

	var SubjectsViewModel = function(){
		var self        = this;
		self.levels     = ko.observableArray([]);
		self.levelCount = ko.computed(function(){
			return self.levels().length;
		}, self);

		self.addLevel = function(level){
			self.levels.push(level);
		};

		self.getData = function(data, event){
			var filename = null,
				attr     = event.target.attributes;
			for(var i = 0, l = attr.length; i < l; i++){
				if(attr[i].name === "data-json"){
					filename = attr[i].value;
				}
			}
			if(filename === null){
				return;
			}

			$.getJSON(filename, function(data){
				$('#levels').slideUp("slow", function(){
					self.levels.removeAll();
					subjects = [];

					var items  = data.items,
						larr = [];
					for(var i = 0, l = items.length; i < l; i++){
						var it = items[i];
						if(larr[it.level] === undefined){
							larr[it.level] = [];
						}
						larr[it.level].push(it);
					}

					for (var i = 0, l = larr.length; i < l; i++) {
						if(larr[i] !== undefined && larr[i].length > 0){
							var lev = new Level();
							for(var j = 0, m = larr[i].length; j < m; j++){
								var s = new Subject(larr[i][j]);
								subjects[larr[i][j]['id']] = s;
								lev.subjects.push(s);
							}
							self.levels.push(lev);
						}
					}

					var conn = data.connections;
					for(var i = 0, l = conn.length; i < l; i++){
						var curr = conn[i],
							id   = curr["item"],
							subj = subjects[id];
						if(subj === undefined){
							continue;
						}

						var parents = curr["needed"];
						if(typeof(parents) === "string"){
							var p = subjects[parents];
							if(p !== undefined){
								subj.parents.push(p);
							}
						}else{
							for(var j = 0, m = parents.length; j < m; j++){
								var pid = parents[j],
									p   = subjects[pid];
								if(p !== undefined){
									subj.parents.push(p);
								}
							}
						}
					}

					$("#levels").slideDown("slow");
				});
			});
		};
	};

	var subjectsViews = new SubjectsViewModel();
	
	ko.applyBindings(subjectsViews);

});
