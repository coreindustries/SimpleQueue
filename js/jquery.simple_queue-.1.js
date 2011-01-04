/**
SIMPLE LOADING QUEUE
v 0.1

Load images sequentially. Useful when 1 image needs to be diplayed before others.

works with FF, Safari, Chrome, IE6, IE7, IE8


@author Corey Szopinski | cszopinski@cpbgroup.com

USAGE:
var q1 = new SimpleQueue();
q1.add('bigimage.jpg', 'alt image attribue', $('#div'));
q1.add('bigimage2.jpg', 'alt image attribue', $('#div'));
q1.start();


CALLBACK:
handleQueueFinished()  - fired when queue is complete

Multiple queues can run on the same page, either in parallel or sequentially


references: http://jqueryfordesigners.com/image-loading/
**/

function SimpleQueue(){
	this._q = new Array(0)
	
	this._state = {
		timestart : new Date(),				// used to calc elapsed time
		counter : 0							// unique queue id, used to notate image load order, and the total items put into the queue
	}
	
	
	// get the remaining items
	this.getRemainingItems = function(){
		return this._q.length;
	}
	
	// add items to the queue
	// src: relative or absolute url to image
	// title: title attribute (for accessibility)
	// element_id: the DOM element this should be appended to
	// delay: delay after parent is loaded, before load starts on this image (NOT IMPLEMENTED YET, DUE TO LACK OF NATIVE SLEEP() METHOD)
	this.add = function(src, title, element_id, delay){
		
		title 		= title == undefined ? path : title;
		element_id 	= element_id == undefined ? $('body') : element_id;
		delay 		= delay == undefined ? 0 : delay;
		
		this._q.push(	
			{ src : src, 
			  title : title,
			  element_id : element_id,
			  delay : delay,
			  q_id : ++this._state.counter
			 }
		);
	}
	
	this.start = function(){
		this.loadNextItem();
	}
	
	
	// grabs the first item in the FIFO queue, loads it, then the next item, etc
	this.loadNextItem = function(){
		if(this.getRemainingItems() < 1){
			this.eventQueueFinished();
			return;
		}
		
		var _img = new Image();
		_img.parent = this;
		var _i = this._q.shift();
		$(_i.element_id).append(_img);
		
		$(_img)
		.attr('src', _i.src)
		.attr('elap_time', new Date() - this._state.timestart)
		.attr('q_id', _i.q_id)
		.error(function(e){
			log('ERROR: ');
			log(e);
			this.parent.loadNextItem();
		})
		.load(function () {
			//logTo('#console3', _i.src+' loaded');
			var _s = this.parent.getStatus();
			log(_i.src+' loaded, '+_s.percent+'% remaining');
			this.parent.loadNextItem();
		});

	}
	
	
	
	this.getStatus = function(){
		 _r = {};
		 _r.status = "SimpleQueued. Started: "+this._state.timestart+" | items: "+this.getRemainingItems();
		_r.items_remaining = this.getRemainingItems();
		_r.total_items = this._state.counter
		_r.percent =  Math.floor( (_r.items_remaining / _r.total_items)*100 );
		_r.q = this._q;
		_r.elapsed_time = new Date() - this._state.timestart;
		return _r;
	}
	
	this.eventQueueFinished = function(){
		this._state.total_time = new Date() - this._state.timestart;
		log("queue finished. elapsed time: "+this._state.total_time+" ms");
		log('----');
		// fire external event handler (defined at the window level)
		window.handleQueueFinished();
	}
	
};



// usage: log('inside coolFunc',this,arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
	
	// COMMENT OUT FOR PRODUCTION
	
	log.history = log.history || [];   // store logs to an array for reference
	log.history.push(arguments);

	// log to html console. 
	if($('#console')){
		logTo('#console', Array.prototype.slice.call(arguments));
	}

	// log to firebug console
	if(this.console){
		console.log( Array.prototype.slice.call(arguments) );
	}
};