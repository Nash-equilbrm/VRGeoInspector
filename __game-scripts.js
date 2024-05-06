const GameFlowEvent={ON_FLOW_CHANGED:"ON_FLOW_CHANGED",ON_FLOW_ENTER:"ON_FLOW_ENTER",ON_FLOW_EXIT:"ON_FLOW_EXIT"},GameStateName={PREV:"GAME_PREVIOUS_STATE",INIT:"GAME_INIT_STATE",NORMAL:"GAME_NORMAL_STATE",FREE_LOOK:"GAME_FREELOOK_STATE",INSPECT_ROCK:"GAME_INSPECT_ROCK_STATE",FREEZE:"GAME_FREEZE_STATE",CHANGE_SHELVE_STATE:"CHANGE_SHELVE_STATE"},GameInputEvent={PLAYER_ON_MOUSE_DOWN:"PLAYER_ON_MOUSE_DOWN",PLAYER_ON_MOUSE_UP:"PLAYER_ON_MOUSE_UP",PLAYER_ON_MOUSE_MOVE:"PLAYER_ON_MOUSE_MOVE",PLAYER_MOVE_LEFT_CLICK:"PLAYER_MOVE_LEFT_CLICK",PLAYER_MOVE_RIGHT_CLICK:"PLAYER_MOVE_RIGHT_CLICK",ARROW_CLICKED:"ARROW_CLICKED"};var UIManager=pc.createScript("uimanager");UIManager.attributes.add("_rockInspectPopup",{type:"entity",title:"Rock Inspect Popup"}),UIManager.attributes.add("_rockInspectTurnOffBtn",{type:"entity",title:"Rock Inspect Turn Off Btn"}),UIManager.attributes.add("_rockName",{type:"entity",title:"Rock Name"}),UIManager.attributes.add("_rockInfo",{type:"entity",title:"Rock Info"}),UIManager.attributes.add("_switchLeftBtn",{type:"entity",title:"Switch Left Btn"}),UIManager.attributes.add("_switchRightBtn",{type:"entity",title:"Switch Right Btn"}),UIManager.attributes.add("_turnDeviceHorizontalPanel",{type:"entity",title:"TurnDeviceHorizontalPanel"}),UIManager.attributes.add("_switchShelveLayout",{type:"entity",title:"Switch Shelve Layout"}),UIManager.prototype.initialize=function(){this.app.on(GameFlowEvent.ON_FLOW_ENTER,this.onStateEnter,this),this.app.on(GameFlowEvent.ON_FLOW_EXIT,this.onStateExit,this),this.on("destroy",(function(){this.app.off(GameFlowEvent.ON_FLOW_ENTER,this.onStateEnter,this),this.app.off(GameFlowEvent.ON_FLOW_EXIT,this.onStateExit,this)})),this._rockInspectTurnOffBtn.button.on("click",(function(t){this.app.fire(GameFlowEvent.ON_FLOW_CHANGED,GameStateName.NORMAL)}),this),console.log("init click event"),this._switchLeftBtn.button.on("click",(function(t){this.switchLeftPosition()}),this),this._switchRightBtn.button.on("click",(function(t){this.switchRightPosition()}),this)},UIManager.prototype.onStateEnter=function(t,e){switch(t){case GameStateName.INIT:break;case GameStateName.NORMAL:case GameStateName.FREE_LOOK:this._rockInspectPopup.enabled=!1,this._switchShelveLayout.enabled=!0;break;case GameStateName.INSPECT_ROCK:this._rockInspectPopup.enabled=!0,this._rockName.element.text=`Rock No.${10*e[0]+e[1]}`,this._rockInfo.element.text=`Information of rock sample number ${10*e[0]+e[1]} will be displayed here.`;break;case GameStateName.FREEZE:this._turnDeviceHorizontalPanel.enabled=!0}},UIManager.prototype.onStateExit=function(t,e){switch(t){case GameStateName.INIT:break;case GameStateName.NORMAL:case GameStateName.FREE_LOOK:this._switchShelveLayout.enabled=!1;break;case GameStateName.INSPECT_ROCK:this._rockInspectPopup.enabled=!1;break;case GameStateName.FREEZE:this._turnDeviceHorizontalPanel.enabled=!1}},UIManager.prototype.switchLeftPosition=function(){var t=GameManager.instance;t._currentShelveID>0&&(t.changeState(t._changeShelveState),t._currentShelveID-=1,this.app.fire(GameInputEvent.PLAYER_MOVE_LEFT_CLICK,[]))},UIManager.prototype.switchRightPosition=function(){var t=GameManager.instance;t._currentShelveID<t._shelves.length-1&&(t.changeState(t._changeShelveState),t._currentShelveID+=1,this.app.fire(GameInputEvent.PLAYER_MOVE_RIGHT_CLICK,[]))};var GameManager=pc.createScript("gameManager");GameManager.attributes.add("_uiManager",{type:"entity",title:"UI Manager"}),GameManager.attributes.add("_playerController",{type:"entity",title:"Player Controller"}),GameManager.attributes.add("_cameraEntity",{type:"entity",title:"Camera"}),GameManager.attributes.add("_inspectRockPosition",{type:"entity",title:"RockInspectPosition"}),GameManager.attributes.add("_shelves",{type:"entity",array:!0,title:"Shelves"}),GameManager.attributes.add("_currentShelveID",{type:"number",title:"CurrentShelveID"}),GameManager.prototype.initialize=function(){GameManager.instance?console.error("Instance already created"):(GameManager.instance=this,this.on("destroy",(function(){GameManager.instance=null}))),this._chosenRockId=-1,this._stateMachine=new StateMachine,this._initGameState=new GameInitState(this),this._normalGameState=new GameNormalState(this),this._inspectRockGameState=new GameInspectRockState(this),this._freelookGameState=new GameFreelookState(this),this._freezeGameState=new GameFreezeState(this),this._changeShelveState=new GameChangeShelveState(this),this._stateMachine.initialize(this._initGameState),this._canInteract=!1,window.addEventListener("orientationchange",this.calculateDimensions,!1),window.addEventListener("resize",this.calculateDimensions,!1),this.calculateDimensions()},GameManager.prototype.update=function(e){this._stateMachine.logicUpdate(e)},GameManager.prototype.calculateDimensions=function(){var e=window.innerWidth,t=window.innerHeight;if(e>t){this._canInteract=!0}else e<t&&(this._canInteract=!1)},GameManager.prototype.repositionInspectRockPos=function(){var e=this._cameraEntity.camera.screenToWorld(window.innerWidth/3,this._inspectRockPosition.getPosition().y,this._inspectRockPosition.getPosition().z);this._inspectRockPosition.setPosition(e.x,e.y,e.z),console.log("inspect pos: "+this._inspectRockPosition.getPosition())},GameManager.prototype.changeState=function(e){this._stateMachine.changeState(e)},GameManager.prototype.changeToPrevState=function(){this._stateMachine.changeState(this._stateMachine._cachedState)};class StateMachine{_currentState=null;_cachedState=null;initialize(t){null===this._currentState&&(this._currentState=t,this._currentState.enterState())}changeState(t){this._currentState!==t&&(this._cachedState=this._currentState,this._currentState.exitState(),this._currentState=t,this._currentState.enterState())}logicUpdate(t){this._currentState.updateState(t)}}class StateBase{constructor(t){this._context=t}enterState(){}updateState(t){}exitState(){}}class GameInitState extends StateBase{constructor(t){super(t),this._duration=1,this._timer=0,this._stateName=GameStateName.INIT}enterState(){console.log("GameInitState enter");var t=this._context._shelves[this._context._currentShelveID].script.shelve,e=new pc.Vec3(t.entity.getPosition().x,t.entity.getPosition().y,t.entity.getPosition().z);e.x+=t._inspectPosition.x,e.y+=t._inspectPosition.y,e.z+=t._inspectPosition.z,this._context._playerController.setPosition(e),this._context.app.fire(GameFlowEvent.ON_FLOW_ENTER,this._stateName,[])}updateState(t){this._context.calculateDimensions(),this._context._canInteract?this._context.changeState(this._context._freelookGameState):this._context.changeState(this._context._freezeGameState)}exitState(){console.log("GameInitState exit"),this._context.app.fire(GameFlowEvent.ON_FLOW_EXIT,this._stateName,[])}}class GameNormalState extends StateBase{constructor(t){super(t),this._stateName=GameStateName.NORMAL}enterState(){console.log("GameNormalState enter"),this._context.app.mouse.on(pc.EVENT_MOUSEDOWN,this.onClick,this),this._context.app.fire(GameFlowEvent.ON_FLOW_ENTER,this._stateName,[])}updateState(t){this._context.calculateDimensions(),this._context._canInteract||(console.log("GameNormalState change to freeze"),this._context.changeState(this._context._freezeGameState))}exitState(){console.log("GameNormalState exit"),this._context.app.mouse.off(pc.EVENT_MOUSEDOWN,this.onClick,this),this._context.app.fire(GameFlowEvent.ON_FLOW_EXIT,this._stateName,[])}onClick(t){var e=this._context._cameraEntity.getPosition().z,o=new pc.Vec3;this._context._cameraEntity.camera.screenToWorld(t.x,t.y,e,o),this.inspectRock(o.x,o.y)?this._context.changeState(this._context._inspectRockGameState):(console.log("onClick"),this._context.changeState(this._context._freelookGameState))}inspectRock(t,e){for(var o=999,c=-1,a=this._context._shelves[this._context._currentShelveID].script.shelve,n=0;n<a._rockHolders.length;n++){var s=a._rockHolders[n].getPosition(),i=s.distance(new pc.Vec3(t,e,0));i<1+s.z&&i<o&&(o=i,c=n)}return c>=0&&c<a._rockHolders.length&&void 0!==a._rockHolders[c].children[0].children[0]&&(console.log(void 0!==a._rockHolders[c].children[0].children[0]),this._context._chosenRockId=c,!0)}}class GameInspectRockState extends StateBase{constructor(t){super(t),this._stateName=GameStateName.INSPECT_ROCK,this._selectedRockHolder=null}enterState(){console.log("GameInspectRockState enter");var t=this._context._shelves[this._context._currentShelveID].script.shelve;this._selectedRockHolder=t._rockHolders[this._context._chosenRockId].script.rockHolder,this._context.app.fire(GameFlowEvent.ON_FLOW_ENTER,this._stateName,[this._context._currentShelveID,this._context._chosenRockId]),this._context.app.on(GameFlowEvent.ON_FLOW_CHANGED,this.exitInspectMode,this)}updateState(t){this._context.calculateDimensions(),this._context._canInteract||this._context.changeState(this._context._freezeGameState)}exitState(){this._context.app.off(GameFlowEvent.ON_FLOW_CHANGED,this.exitInspectMode,this),this._context.app.fire(GameFlowEvent.ON_FLOW_EXIT,this._stateName,[]),this._selectedRockHolder=null}exitInspectMode(t){switch(t){case GameStateName.NORMAL:this._context.changeState(this._context._freelookGameState);break;case GameStateName.PREV:this._context.changeToPrevState()}}}var RockHolder=pc.createScript("rockHolder");RockHolder.attributes.add("_rockEntity",{type:"entity",title:"Rock Entity"}),RockHolder.attributes.add("_light",{type:"entity",title:"Display Light"}),RockHolder.attributes.add("_rockId",{type:"number",title:"Rock ID"}),RockHolder.attributes.add("_shelveID",{type:"number",title:"Shelve ID"}),RockHolder.attributes.add("_rockInfo",{type:"string",title:"Rock Info"}),RockHolder.prototype.initialize=function(){this._rockId--,this._stateMachine=new StateMachine,this._normalState=new RockNormalState(this),this._inspectRockState=new RockInspectState(this),this._freezeRockState=new RockFreezeState(this),this._stateMachine.initialize(this._normalState),this.app.on(GameFlowEvent.ON_FLOW_ENTER,this.onStateEnter,this),this.on("destroy",(function(){this.app.off(GameFlowEvent.ON_FLOW_ENTER,this.onStateEnter,this)})),this._rockEntity.children[0]?(null===this._light&&(this._light=PrefabManager.instance._rockSpotLight.clone(),this.entity.addChild(this._light),this._light.setLocalPosition(0,2,1),this._light.setLocalEulerAngles(45,0,0)),this._light.enabled=!0):null!==this._light&&(this._light.enabled=!1)},RockHolder.prototype.update=function(t){this._stateMachine.logicUpdate(t)},RockHolder.prototype.onStateEnter=function(t,e){switch(t){case GameStateName.INIT:break;case GameStateName.NORMAL:case GameStateName.FREE_LOOK:this._stateMachine.changeState(this._normalState);break;case GameStateName.INSPECT_ROCK:this._shelveID==e[0]&&this._rockId==e[1]&&this._stateMachine.changeState(this._inspectRockState);break;case GameStateName.FREEZE:this._stateMachine.changeState(this._freezeRockState)}},RockHolder.prototype.enableRockRotation=function(t){this._rockEntity.script.rotate.enabled=t};class RockNormalState extends StateBase{constructor(t){super(t),this._moveDuration=1500}enterState(){this._context._rockEntity&&(this._context._rockEntity.getLocalPosition().equals(pc.Vec3.ZERO)||this._context._rockEntity.tween(this._context._rockEntity.getLocalPosition()).to(new pc.Vec3(0,0,0),1,pc.SineOut).loop(!1).yoyo(!1).start(),this._context._rockEntity.getLocalEulerAngles().equals(pc.Vec3.ZERO)||this._context._rockEntity.tween(this._context._rockEntity.getLocalEulerAngles()).rotate(new pc.Vec3(0,0,0),1,pc.Linear).loop(!1).yoyo(!1).start())}updateState(t){}exitState(){}}pc.extend(pc,function(){var TweenManager=function(t){this._app=t,this._tweens=[],this._add=[]};TweenManager.prototype={add:function(t){return this._add.push(t),t},update:function(t){for(var i=0,e=this._tweens.length;i<e;)this._tweens[i].update(t)?i++:(this._tweens.splice(i,1),e--);if(this._add.length){for(let t=0;t<this._add.length;t++)this._tweens.indexOf(this._add[t])>-1||this._tweens.push(this._add[t]);this._add.length=0}}};var Tween=function(t,i,e){pc.events.attach(this),this.manager=i,e&&(this.entity=null),this.time=0,this.complete=!1,this.playing=!1,this.stopped=!0,this.pending=!1,this.target=t,this.duration=0,this._currentDelay=0,this.timeScale=1,this._reverse=!1,this._delay=0,this._yoyo=!1,this._count=0,this._numRepeats=0,this._repeatDelay=0,this._from=!1,this._slerp=!1,this._fromQuat=new pc.Quat,this._toQuat=new pc.Quat,this._quat=new pc.Quat,this.easing=pc.Linear,this._sv={},this._ev={}},_parseProperties=function(t){var i;return t instanceof pc.Vec2?i={x:t.x,y:t.y}:t instanceof pc.Vec3?i={x:t.x,y:t.y,z:t.z}:t instanceof pc.Vec4||t instanceof pc.Quat?i={x:t.x,y:t.y,z:t.z,w:t.w}:t instanceof pc.Color?(i={r:t.r,g:t.g,b:t.b},void 0!==t.a&&(i.a=t.a)):i=t,i};Tween.prototype={to:function(t,i,e,s,n,r){return this._properties=_parseProperties(t),this.duration=i,e&&(this.easing=e),s&&this.delay(s),n&&this.repeat(n),r&&this.yoyo(r),this},from:function(t,i,e,s,n,r){return this._properties=_parseProperties(t),this.duration=i,e&&(this.easing=e),s&&this.delay(s),n&&this.repeat(n),r&&this.yoyo(r),this._from=!0,this},rotate:function(t,i,e,s,n,r){return this._properties=_parseProperties(t),this.duration=i,e&&(this.easing=e),s&&this.delay(s),n&&this.repeat(n),r&&this.yoyo(r),this._slerp=!0,this},start:function(){var t,i,e,s;if(this.playing=!0,this.complete=!1,this.stopped=!1,this._count=0,this.pending=this._delay>0,this._reverse&&!this.pending?this.time=this.duration:this.time=0,this._from){for(t in this._properties)this._properties.hasOwnProperty(t)&&(this._sv[t]=this._properties[t],this._ev[t]=this.target[t]);this._slerp&&(this._toQuat.setFromEulerAngles(this.target.x,this.target.y,this.target.z),i=void 0!==this._properties.x?this._properties.x:this.target.x,e=void 0!==this._properties.y?this._properties.y:this.target.y,s=void 0!==this._properties.z?this._properties.z:this.target.z,this._fromQuat.setFromEulerAngles(i,e,s))}else{for(t in this._properties)this._properties.hasOwnProperty(t)&&(this._sv[t]=this.target[t],this._ev[t]=this._properties[t]);this._slerp&&(i=void 0!==this._properties.x?this._properties.x:this.target.x,e=void 0!==this._properties.y?this._properties.y:this.target.y,s=void 0!==this._properties.z?this._properties.z:this.target.z,void 0!==this._properties.w?(this._fromQuat.copy(this.target),this._toQuat.set(i,e,s,this._properties.w)):(this._fromQuat.setFromEulerAngles(this.target.x,this.target.y,this.target.z),this._toQuat.setFromEulerAngles(i,e,s)))}return this._currentDelay=this._delay,this.manager.add(this),this},pause:function(){this.playing=!1},resume:function(){this.playing=!0},stop:function(){this.playing=!1,this.stopped=!0},delay:function(t){return this._delay=t,this.pending=!0,this},repeat:function(t,i){return this._count=0,this._numRepeats=t,this._repeatDelay=i||0,this},loop:function(t){return t?(this._count=0,this._numRepeats=1/0):this._numRepeats=0,this},yoyo:function(t){return this._yoyo=t,this},reverse:function(){return this._reverse=!this._reverse,this},chain:function(){for(var t=arguments.length;t--;)t>0?arguments[t-1]._chained=arguments[t]:this._chained=arguments[t];return this},onUpdate:function(t){return this.on("update",t),this},onComplete:function(t){return this.on("complete",t),this},onLoop:function(t){return this.on("loop",t),this},update:function(t){if(this.stopped)return!1;if(!this.playing)return!0;if(!this._reverse||this.pending?this.time+=t*this.timeScale:this.time-=t*this.timeScale,this.pending){if(!(this.time>this._currentDelay))return!0;this._reverse?this.time=this.duration-(this.time-this._currentDelay):this.time-=this._currentDelay,this.pending=!1}var i=0;(!this._reverse&&this.time>this.duration||this._reverse&&this.time<0)&&(this._count++,this.complete=!0,this.playing=!1,this._reverse?(i=this.duration-this.time,this.time=0):(i=this.time-this.duration,this.time=this.duration));var e,s,n=0===this.duration?1:this.time/this.duration,r=this.easing(n);for(var h in this._properties)this._properties.hasOwnProperty(h)&&(e=this._sv[h],s=this._ev[h],this.target[h]=e+(s-e)*r);if(this._slerp&&this._quat.slerp(this._fromQuat,this._toQuat,r),this.entity&&(this.entity._dirtifyLocal(),this.element&&this.entity.element&&(this.entity.element[this.element]=this.target),this._slerp&&this.entity.setLocalRotation(this._quat)),this.fire("update",t),this.complete){var a=this._repeat(i);return a?this.fire("loop"):(this.fire("complete",i),this.entity&&this.entity.off("destroy",this.stop,this),this._chained&&this._chained.start()),a}return!0},_repeat:function(t){if(this._count<this._numRepeats){if(this._reverse?this.time=this.duration-t:this.time=t,this.complete=!1,this.playing=!0,this._currentDelay=this._repeatDelay,this.pending=!0,this._yoyo){for(var i in this._properties){var e=this._sv[i];this._sv[i]=this._ev[i],this._ev[i]=e}this._slerp&&(this._quat.copy(this._fromQuat),this._fromQuat.copy(this._toQuat),this._toQuat.copy(this._quat))}return!0}return!1}};var BounceOut=function(t){return t<1/2.75?7.5625*t*t:t<2/2.75?7.5625*(t-=1.5/2.75)*t+.75:t<2.5/2.75?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375},BounceIn=function(t){return 1-BounceOut(1-t)};return{TweenManager:TweenManager,Tween:Tween,Linear:function(t){return t},QuadraticIn:function(t){return t*t},QuadraticOut:function(t){return t*(2-t)},QuadraticInOut:function(t){return(t*=2)<1?.5*t*t:-.5*(--t*(t-2)-1)},CubicIn:function(t){return t*t*t},CubicOut:function(t){return--t*t*t+1},CubicInOut:function(t){return(t*=2)<1?.5*t*t*t:.5*((t-=2)*t*t+2)},QuarticIn:function(t){return t*t*t*t},QuarticOut:function(t){return 1- --t*t*t*t},QuarticInOut:function(t){return(t*=2)<1?.5*t*t*t*t:-.5*((t-=2)*t*t*t-2)},QuinticIn:function(t){return t*t*t*t*t},QuinticOut:function(t){return--t*t*t*t*t+1},QuinticInOut:function(t){return(t*=2)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2)},SineIn:function(t){return 0===t?0:1===t?1:1-Math.cos(t*Math.PI/2)},SineOut:function(t){return 0===t?0:1===t?1:Math.sin(t*Math.PI/2)},SineInOut:function(t){return 0===t?0:1===t?1:.5*(1-Math.cos(Math.PI*t))},ExponentialIn:function(t){return 0===t?0:Math.pow(1024,t-1)},ExponentialOut:function(t){return 1===t?1:1-Math.pow(2,-10*t)},ExponentialInOut:function(t){return 0===t?0:1===t?1:(t*=2)<1?.5*Math.pow(1024,t-1):.5*(2-Math.pow(2,-10*(t-1)))},CircularIn:function(t){return 1-Math.sqrt(1-t*t)},CircularOut:function(t){return Math.sqrt(1- --t*t)},CircularInOut:function(t){return(t*=2)<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)},BackIn:function(t){var i=1.70158;return t*t*((i+1)*t-i)},BackOut:function(t){var i=1.70158;return--t*t*((i+1)*t+i)+1},BackInOut:function(t){var i=2.5949095;return(t*=2)<1?t*t*((i+1)*t-i)*.5:.5*((t-=2)*t*((i+1)*t+i)+2)},BounceIn:BounceIn,BounceOut:BounceOut,BounceInOut:function(t){return t<.5?.5*BounceIn(2*t):.5*BounceOut(2*t-1)+.5},ElasticIn:function(t){var i,e=.1;return 0===t?0:1===t?1:(!e||e<1?(e=1,i=.1):i=.4*Math.asin(1/e)/(2*Math.PI),-e*Math.pow(2,10*(t-=1))*Math.sin((t-i)*(2*Math.PI)/.4))},ElasticOut:function(t){var i,e=.1;return 0===t?0:1===t?1:(!e||e<1?(e=1,i=.1):i=.4*Math.asin(1/e)/(2*Math.PI),e*Math.pow(2,-10*t)*Math.sin((t-i)*(2*Math.PI)/.4)+1)},ElasticInOut:function(t){var i,e=.1,s=.4;return 0===t?0:1===t?1:(!e||e<1?(e=1,i=.1):i=s*Math.asin(1/e)/(2*Math.PI),(t*=2)<1?e*Math.pow(2,10*(t-=1))*Math.sin((t-i)*(2*Math.PI)/s)*-.5:e*Math.pow(2,-10*(t-=1))*Math.sin((t-i)*(2*Math.PI)/s)*.5+1)}}}()),function(){pc.AppBase.prototype.addTweenManager=function(){this._tweenManager=new pc.TweenManager(this),this.on("update",(function(t){this._tweenManager.update(t)}))},pc.AppBase.prototype.tween=function(t){return new pc.Tween(t,this._tweenManager)},pc.Entity.prototype.tween=function(t,i){var e=this._app.tween(t);return e.entity=this,this.once("destroy",e.stop,e),i&&i.element&&(e.element=i.element),e};var t=pc.AppBase.getApplication();t&&t.addTweenManager()}();class RockInspectState extends StateBase{constructor(t){super(t),this._moveDuration=1500,this._selfRotate=!1,this._rotationControl=this._context._rockEntity.script.rotate,this._rockInspectInit=!1}enterState(){this._targetPosition=new pc.Vec3(0,0,0),this._targetPosition.x=GameManager.instance._inspectRockPosition.getPosition().x-this._context.entity.getPosition().x,this._targetPosition.y=GameManager.instance._inspectRockPosition.getPosition().y-this._context.entity.getPosition().y,this._targetPosition.z=GameManager.instance._inspectRockPosition.getPosition().z-this._context.entity.getPosition().z,this._context.app.mouse.on(pc.EVENT_MOUSEDOWN,this.stopSelfRotate,this),this._context.app.mouse.on(pc.EVENT_MOUSEUP,this.startSelfRotate,this),this._context.app.touch&&(this._context.app.touch.on(pc.EVENT_TOUCHSTART,this.stopSelfRotate,this),this._context.app.touch.on(pc.EVENT_TOUCHEND,this.startSelfRotate,this)),this._context._rockEntity&&this._context._rockEntity.getLocalPosition()!==this._targetPosition&&(console.log(this._context._rockEntity.getLocalPosition()),console.log(this._targetPosition),console.log(this._context._rockEntity),console.log(this._context._rockEntity.tween(this._context._rockEntity.getLocalPosition()).to(this._targetPosition,1,pc.SineOut).loop(!1).yoyo(!1).start()))}updateState(t){!this._rockInspectInit&&this._context._rockEntity.getLocalPosition().equals(this._targetPosition)?(this._context.enableRockRotation(!0),this._selfRotate=!0,this._rockInspectInit=!0):this._selfRotate&&this._rotationControl&&this._rotationControl.rotate(2,0)}exitState(){this._context.app.mouse.off(pc.EVENT_MOUSEDOWN,this.stopSelfRotate,this),this._context.app.mouse.off(pc.EVENT_MOUSEUP,this.startSelfRotate,this),this._context.app.touch&&(this._context.app.touch.off(pc.EVENT_TOUCHSTART,this.stopSelfRotate,this),this._context.app.touch.off(pc.EVENT_TOUCHEND,this.startSelfRotate,this)),this._context.enableRockRotation(!1),this._selfRotate=!1,this._rockInspectInit=!1}stopSelfRotate(t){var o=this._context._rockEntity.getPosition(),e=new pc.Vec3;GameManager.instance._cameraEntity.camera.worldToScreen(o,e),e.distance(new pc.Vec3(t.x,t.y,e.z))<150&&(this._selfRotate=!1)}startSelfRotate(t){this._selfRotate=!0}}var Rotate=pc.createScript("rotate");Rotate.attributes.add("cameraEntity",{type:"entity",title:"Camera Entity"}),Rotate.attributes.add("orbitSensitivity",{type:"number",default:.3,title:"Orbit Sensitivity",description:"How fast the camera moves around the orbit. Higher is faster"}),Rotate.prototype.initialize=function(){this.lastTouchPoint=new pc.Vec2,this.registerEvents(),this.on("enable",(function(){this.registerEvents()}),this),this.on("disable",(function(){this.unregisterEvents()}),this),this.on("destroy",(function(){this.unregisterEvents()}),this),this._isRotating=!1},Rotate.prototype.registerEvents=function(){this.app.mouse.on(pc.EVENT_MOUSEMOVE,this.onMouseMove,this),this.app.mouse.on(pc.EVENT_MOUSEDOWN,this.onMouseDown,this),this.app.touch&&(this.app.touch.on(pc.EVENT_TOUCHSTART,this.onTouchStart,this),this.app.touch.on(pc.EVENT_TOUCHMOVE,this.onTouchMove,this),this.app.touch.on(pc.EVENT_TOUCHEND,this.onTouchEnd,this))},Rotate.prototype.unregisterEvents=function(){this.app.mouse.off(pc.EVENT_MOUSEMOVE,this.onMouseMove,this),this.app.mouse.off(pc.EVENT_MOUSEDOWN,this.onMouseDown,this),this.app.touch&&(this.app.touch.off(pc.EVENT_TOUCHSTART,this.onTouchStart,this),this.app.touch.off(pc.EVENT_TOUCHMOVE,this.onTouchMove,this),this.app.touch.off(pc.EVENT_TOUCHEND,this.onTouchEnd,this))},Rotate.horizontalQuat=new pc.Quat,Rotate.verticalQuat=new pc.Quat,Rotate.resultQuat=new pc.Quat,Rotate.prototype.rotate=function(t,o){var i=Rotate.horizontalQuat,e=Rotate.verticalQuat,s=Rotate.resultQuat;i.setFromAxisAngle(this.cameraEntity.up,t*this.orbitSensitivity),e.setFromAxisAngle(this.cameraEntity.right,o*this.orbitSensitivity),s.mul2(i,e),s.mul(this.entity.getRotation()),this.entity.setRotation(s)},Rotate.prototype.onTouchStart=function(t){var o=t.touches[0];this.lastTouchPoint.set(o.x,o.y);var i=this.entity.getPosition(),e=new pc.Vec3;this.cameraEntity.camera.worldToScreen(i,e),e.distance(new pc.Vec3(o.x,o.y,e.z))<150&&(this._isRotating=!0)},Rotate.prototype.onTouchMove=function(t){var o=t.touches[0],i=o.x-this.lastTouchPoint.x,e=o.y-this.lastTouchPoint.y;this._isRotating&&this.rotate(i,e),this.lastTouchPoint.set(o.x,o.y)},Rotate.prototype.onTouchEnd=function(t){this._isRotating=!1},Rotate.prototype.onMouseMove=function(t){this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT)?this._isRotating&&this.rotate(t.dx,t.dy):this._isRotating=!1},Rotate.prototype.onMouseDown=function(t){var o=this.entity.getPosition(),i=new pc.Vec3;this.cameraEntity.camera.worldToScreen(o,i),i.distance(new pc.Vec3(t.x,t.y,i.z))<150&&(this._isRotating=!0)};class GameFreezeState extends StateBase{constructor(e){super(e),this._stateName=GameStateName.FREEZE}enterState(){console.log("GameFreezeState enter"),this._context.app.fire(GameFlowEvent.ON_FLOW_ENTER,this._stateName,[])}updateState(e){this._context.calculateDimensions(),this._context._canInteract?(console.log("CHANGE TO PREVIOUS STATE"),this._context.changeToPrevState()):console.log("I DONT WANT TO EXIT")}exitState(){console.log("GameFreezeState exit"),this._context.app.fire(GameFlowEvent.ON_FLOW_EXIT,this._stateName,[])}}class RockFreezeState extends StateBase{constructor(e){super(e)}enterState(){}updateState(e){}exitState(){}}var LoadGlbAsset=pc.createScript("loadGlbAsset");LoadGlbAsset.attributes.add("glbAsset",{type:"asset",assetType:"binary"}),LoadGlbAsset.prototype.initialize=function(){utils.loadGlbContainerFromAsset(this.glbAsset,null,this.glbAsset.name,function(t,s){if(t)console.error(t);else{var e=s.resource.instantiateRenderEntity();this.entity.addChild(e)}}.bind(this))};!function(){var n={},e=pc.Application.getApplication();n.loadGlbContainerFromAsset=function(n,t,o,a){var r=function(n){var e=new Blob([n.resource]),r=URL.createObjectURL(e);return this.loadGlbContainerFromUrl(r,t,o,(function(n,e){a(n,e),URL.revokeObjectURL(r)}))}.bind(this);n.ready(r),e.assets.load(n)},n.loadGlbContainerFromUrl=function(n,t,o,a){var r=o+".glb",i={url:n,filename:r},l=new pc.Asset(r,"container",i,null,t);return l.once("load",(function(n){if(a){var e=n.resource.animations;if(1==e.length)e[0].name=o;else if(e.length>1)for(var t=0;t<e.length;++t)e[t].name=o+" "+t.toString();a(null,n)}})),e.assets.add(l),e.assets.load(l),l},window.utils=n}();var LoadGlbUrl=pc.createScript("loadGlbUrl");LoadGlbUrl.attributes.add("serverUrl",{type:"string"}),LoadGlbUrl.prototype.initialize=function(){console.log("URL for rocks in shelve: 1");var r=this;pc.http.get(this.serverUrl+"/api/shelves/1?populate=deep,3",(function(t,e){t?print(t):e.data.attributes.rocks.data.forEach((function(t){var e=r.serverUrl+t.attributes.model.data[0].attributes.url;r.loadModel(e)}))}))},LoadGlbUrl.prototype.loadModel=function(r,t,e){var a=r.substring(r.lastIndexOf("/")+1);utils.loadGlbContainerFromUrl(r,null,a,function(r,t){if(r)console.error(r);else for(var e=0;e<GameManager.instance._rockHolders.length;e++){var a=GameManager.instance._rockHolders[e].script.rockHolder._rockEntity,o=t.resource.instantiateRenderEntity();a.addChild(o)}}.bind(this))};var LoadObjModel=pc.createScript("loadObjModel");LoadObjModel.attributes.add("_objModelUrl",{type:"string",title:"Obj url",default:"path/to/your/model.obj"}),LoadObjModel.prototype.initialize=function(){""!==this._objModelUrl&&this.loadObjModel(this._objModelUrl)},LoadObjModel.prototype.loadObjModel=function(o){var e=new pc.Asset("objModel","model",{url:o});this.app.assets.add(e),this.app.assets.load(e);var t=this;e.ready((function(){(new pc.Model).graph=e.resource;var o=new pc.Entity;o.addComponent("model",{type:"asset",asset:e}),t.app.root.addChild(o)}))};var Shelve=pc.createScript("shelve");Shelve.attributes.add("_inspectPosition",{type:"vec3",title:"Inspect Shelve Position"}),Shelve.attributes.add("_rockHolders",{type:"entity",array:!0,title:"Rock Holders List"});var PlayerController=pc.createScript("playerController");PlayerController.attributes.add("_cameraEntity",{type:"entity",title:"Camera"}),PlayerController.attributes.add("_leftArrow",{type:"entity",title:"Left Arrow"}),PlayerController.attributes.add("_leftArrowMesh",{type:"entity",title:"Left Arrow Mesh"}),PlayerController.attributes.add("_rightArrow",{type:"entity",title:"Right Arrow"}),PlayerController.attributes.add("_rightArrowMesh",{type:"entity",title:"Right Arrow Mesh"}),PlayerController.prototype.initialize=function(){this.entity.collision.enabled=!1,this.entity.rigidbody.enabled=!1,this.entity.script.freeLookCamera._freeLookEnable=!1,this.app.on(GameInputEvent.ARROW_CLICKED,this.onSelectObject,this),this.app.on(GameFlowEvent.ON_FLOW_ENTER,this.onStateEnter,this),this.app.on(GameInputEvent.PLAYER_MOVE_LEFT_CLICK,this.moveToNextShelve,this),this.app.on(GameInputEvent.PLAYER_MOVE_RIGHT_CLICK,this.moveToNextShelve,this),this.on("destroy",(function(){this.app.off(GameFlowEvent.ON_FLOW_ENTER,this.onStateEnter,this),this.app.off(GameInputEvent.PLAYER_MOVE_LEFT_CLICK,this.moveToNextShelve,this),this.app.off(GameInputEvent.PLAYER_MOVE_RIGHT_CLICK,this.moveToNextShelve,this),this.app.off(GameInputEvent.ARROW_CLICKED,this.onSelectObject,this)})),this.getAdjacentShelve(),this._leftArrow.children[0].tween(this._leftArrow.children[0].getLocalPosition()).to(new pc.Vec3(11,0,0),1,pc.Linear).loop(!0).yoyo(!0).start(),this._rightArrow.children[0].tween(this._rightArrow.children[0].getLocalPosition()).to(new pc.Vec3(11,0,0),1,pc.Linear).loop(!0).yoyo(!0).start()},PlayerController.prototype.update=function(e){if(null===this._nextShelve)this._rightArrow.enabled=!1;else{this._rightArrow.enabled=!0;let e=new pc.Vec3(0,0,0);e.x=this._nextShelve.getPosition().x-this.entity.getPosition().x,e.z=this._nextShelve.getPosition().z-this.entity.getPosition().z,e.normalize();var t=e.dot(pc.Vec3.RIGHT),i=Math.acos(t)*pc.math.RAD_TO_DEG;this._rightArrow.setEulerAngles(0,i,0)}if(null===this._prevShelve)this._leftArrow.enabled=!1;else{this._leftArrow.enabled=!0;let e=new pc.Vec3(0,0,0);e.x=this._prevShelve.getPosition().x-this.entity.getPosition().x,e.z=this._prevShelve.getPosition().z-this.entity.getPosition().z,e.normalize();t=e.dot(pc.Vec3.RIGHT),i=Math.acos(t)*pc.math.RAD_TO_DEG;this._leftArrow.setEulerAngles(0,i,0)}},PlayerController.prototype.onStateEnter=function(e,t){if(e===GameStateName.FREE_LOOK)this.entity.collision.enabled=!0,this.entity.rigidbody.enabled=!0,this.entity.script.freeLookCamera._freeLookEnable=!0;else this.entity.collision.enabled=!1,this.entity.rigidbody.enabled=!1,this.entity.script.freeLookCamera._freeLookEnable=!1},PlayerController.prototype.getAdjacentShelve=function(){let e=GameManager.instance;0===e._currentShelveID?(this._nextShelve=e._shelves[e._currentShelveID+1],this._prevShelve=null):e._currentShelveID===e._shelves.length-1?(this._nextShelve=null,this._prevShelve=e._shelves[e._currentShelveID-1]):(this._nextShelve=e._shelves[e._currentShelveID+1],this._prevShelve=e._shelves[e._currentShelveID-1])},PlayerController.prototype.moveToNextShelve=function(e,t){this.getAdjacentShelve();let i=GameManager.instance;i.changeState(i._changeShelveState);let n=i._shelves[i._currentShelveID].script.shelve,o=new pc.Vec3(n.entity.getPosition().x,n.entity.getPosition().y,n.entity.getPosition().z);o.x+=n._inspectPosition.x,o.y+=n._inspectPosition.y,o.z+=n._inspectPosition.z,this.entity.tween(this.entity.getLocalPosition()).to(o,1,pc.SineOut).loop(!1).yoyo(!1).start()},PlayerController.prototype.onSelectObject=function(e){console.log("onselect");let t=GameManager.instance;e===this._leftArrowMesh&&t._currentShelveID>0?(t._currentShelveID-=1,this.app.fire(GameInputEvent.PLAYER_MOVE_LEFT_CLICK,[])):e===this._rightArrowMesh&&t._currentShelveID<t._shelves.length-1&&(t._currentShelveID+=1,this.app.fire(GameInputEvent.PLAYER_MOVE_RIGHT_CLICK,[]))};class GameFreelookState extends StateBase{constructor(t){super(t),this._stateName=GameStateName.FREE_LOOK}enterState(){console.log("GameFreelookState enter"),this._context.app.fire(GameFlowEvent.ON_FLOW_ENTER,this._stateName,[]),this._context.app.mouse.on(pc.EVENT_MOUSEDOWN,this.onPlayerClick,this)}updateState(t){this._context._canInteract||this._context.changeState(this._context._freezeGameState)}exitState(){console.log("GameFreelookState exit"),this._context.app.fire(GameFlowEvent.ON_FLOW_EXIT,this._stateName,[]),this._context.app.mouse.off(pc.EVENT_MOUSEDOWN,this.onPlayerClick,this)}onPlayerClick(t){var e=this._context._cameraEntity.getPosition().z,o=new pc.Vec3;this._context._cameraEntity.camera.screenToWorld(t.x,t.y,e,o),this.inspectRock(o.x,o.y)&&this._context.changeState(this._context._inspectRockGameState)}inspectRock(t,e){for(var o=999,c=-1,a=this._context._shelves[this._context._currentShelveID].script.shelve,s=0;s<a._rockHolders.length;s++){var n=a._rockHolders[s].getPosition(),i=n.distance(new pc.Vec3(t,e,0));i<1+n.z&&i<o&&(o=i,c=s)}return c>=0&&c<a._rockHolders.length&&void 0!==a._rockHolders[c].children[0].children[0]&&(this._context._chosenRockId=c,!0)}}var FreeLookCamera=pc.createScript("freeLookCamera");FreeLookCamera.attributes.add("_freeLookEnable",{type:"boolean",default:!0}),FreeLookCamera.attributes.add("camera",{type:"entity",description:"Optional, assign a camera entity, otherwise one is created"}),FreeLookCamera.attributes.add("power",{type:"number",default:2500,description:"Adjusts the speed of player movement"}),FreeLookCamera.attributes.add("lookSpeed",{type:"number",default:.25,description:"Adjusts the sensitivity of looking"}),FreeLookCamera.prototype.initialize=function(){this.force=new pc.Vec3,this.eulers=new pc.Vec3,this.app.mouse.on("mousemove",this._onMouseMove,this),this.entity.collision||console.error("First Person Movement script needs to have a 'collision' component"),this.entity.rigidbody&&this.entity.rigidbody.type===pc.BODYTYPE_DYNAMIC||console.error("First Person Movement script needs to have a DYNAMIC 'rigidbody' component")},FreeLookCamera.prototype.update=function(e){this._freeLookEnable&&this.camera.setLocalEulerAngles(this.eulers.y,this.eulers.x,0)},FreeLookCamera.prototype._onMouseMove=function(e){this._freeLookEnable&&(pc.Mouse.isPointerLocked()||e.buttons[0])&&(this.eulers.x-=this.lookSpeed*e.dx,this.eulers.y-=this.lookSpeed*e.dy)};class GameChangeShelveState extends StateBase{constructor(t){super(t),this._stateName=GameStateName.CHANGE_SHELVE_STATE}enterState(){console.log("GameChangeShelveState enter"),this._context.app.fire(GameFlowEvent.ON_FLOW_ENTER,this._stateName,[])}updateState(t){var e=this._context._shelves[this._context._currentShelveID].script.shelve,a=new pc.Vec3(e.entity.getPosition().x,e.entity.getPosition().y,e.entity.getPosition().z);a.x+=e._inspectPosition.x,a.y+=e._inspectPosition.y,a.z+=e._inspectPosition.z,this._context._playerController.getLocalPosition().distance(a)<Number.EPSILON&&this._context.changeState(this._context._freelookGameState)}exitState(){console.log("GameChangeShelveState exit"),this._context.app.fire(GameFlowEvent.ON_FLOW_EXIT,this._stateName,[])}}var PickerFramebuffer=pc.createScript("pickerFramebuffer");PickerFramebuffer.attributes.add("pickAreaScale",{type:"number",title:"Pick Area Scale",description:"1 is more accurate but worse performance. 0.01 is best performance but least accurate. 0.25 is the default.",default:1,min:.01,max:1}),PickerFramebuffer.attributes.add("layerNames",{type:"string",title:"Layers Names",array:!0,description:"Layer names from which objects will be picked from.",default:["World"]}),PickerFramebuffer.prototype.initialize=function(){var e=this.app.graphicsDevice.canvas,t=parseInt(e.clientWidth,10),i=parseInt(e.clientHeight,10);this.picker=new pc.Picker(this.app,t*this.pickAreaScale,i*this.pickAreaScale),this.layers=[];for(var a=0;a<this.layerNames.length;++a){var r=this.app.scene.layers.getLayerByName(this.layerNames[a]);r&&this.layers.push(r)}this.app.mouse.on(pc.EVENT_MOUSEDOWN,this.onSelect,this),this.on("destroy",(function(){this.app.mouse.off(pc.EVENT_MOUSEDOWN,this.onSelect,this)}),this)},PickerFramebuffer.prototype.update=function(e){},PickerFramebuffer.prototype.onSelect=function(e){var t=this.app.graphicsDevice.canvas,i=t.getBoundingClientRect(),a=parseInt(t.clientWidth,10),r=parseInt(t.clientHeight,10),c=e.x-i.left,s=e.y-i.top,p=this.entity.camera,n=this.app.scene,l=this.picker;l.resize(a*this.pickAreaScale,r*this.pickAreaScale),l.prepare(p,n,this.layers);var h=l.getSelection(Math.floor(c*(l.width/a)),l.height-Math.floor(s*(l.height/r)));if(h.length>0){for(var o=h[0].node;null!==o&&!(o instanceof pc.Entity)&&o.script&&o.script.pulse;)o=o.getParent();o&&null!==this._onSelectCallback&&this._onSelectCallback(o)}},PickerFramebuffer.prototype.setOnSelectCallback=function(e){this._onSelectCallback=e};var PrefabManager=pc.createScript("prefabManager");PrefabManager.attributes.add("_rockSpotLight",{type:"entity",title:"Rock Display Light Prefab"}),PrefabManager.prototype.initialize=function(){PrefabManager.instance?console.error("Instance already created"):(PrefabManager.instance=this,this.on("destroy",(function(){PrefabManager.instance=null})))},PrefabManager.prototype.update=function(a){};var ArrowClickDetector=pc.createScript("ArrowClickDetector");ArrowClickDetector.prototype.initialize=function(){this.entity.camera?(this.app.mouse.on(pc.EVENT_MOUSEDOWN,this.mouseDown,this),this.app.touch&&this.app.touch.on(pc.EVENT_TOUCHSTART,this.touchStart,this)):console.error("This script must be applied to an entity with a camera component.")},ArrowClickDetector.prototype.mouseDown=function(t){this.doArrowClickDetector(t.x,t.y)},ArrowClickDetector.prototype.touchStart=function(t){1===t.touches.length&&this.doArrowClickDetector(t.touches[0].x,t.touches[0].y),t.event.preventDefault()},ArrowClickDetector.prototype.doArrowClickDetector=function(t,e){const o=this.entity.getPosition(),i=this.entity.camera.screenToWorld(t,e,this.entity.camera.farClip),r=this.app.systems.rigidbody.raycastFirst(o,i);if(r&&r.entity.layer===pc.LAYERID_MOVEARROW){const t=r.entity;console.log("You selected "+t.name),this.app.fire(GameInputEvent.ARROW_CLICKED,r.entity)}};