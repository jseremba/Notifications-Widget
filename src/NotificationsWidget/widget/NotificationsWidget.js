/* jslint white:true, nomen: true, plusplus: true */
/* global mx, define, require, console */
/* mendix */
/*
    NotificationsWidget
    ========================

    @file      : NotificationsWidget.js
    @version   : 0.1
    @author    : Nick van Wieren
    @date      : Wed, 18 Feb 2015 09:35:50 GMT
    @copyright : 2015
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
    @version: 0.2
    @author: Arjan de Lange
    Changes: Widget now only shows the amount of notifications if there are any. So '0' will no longer be presented.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "mxui/dom",
    "dojo/dom",
    "dojo/query",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html"
], function(declare, _WidgetBase, dom,
    dojoDom, domQuery, domProp,
    domGeom, domClass, domStyle,
    domConstruct, dojoArray, lang, dojoText, html) {
    "use strict";

        // Declare widget's prototype.
    return declare("NotificationsWidget.widget.NotificationsWidget", [ _WidgetBase ], {

            // Parameters configured in the Modeler.
            // mfToExecute: "",
            // messageString: "",
            // backgroundColor: "",
        _notificationCount: null,

            // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handle: null,
        _contextObj: null,
        _objProperty: null,

            // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function() {
                // this._objProperty = {};
        },

            // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function() {
            console.log(this.id + ".postCreate");

                // this.domNode.appendChild(dom.create('span', { 'class': 'notificationswidget-message' }, 'internal property as constant: ' + this.messageString));
            this.domNode.title = this.tooltipCaption;
            this._setupEvents();
        },

            // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function(obj, callback) {
            console.log(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateCounter();

            callback();
        },

            // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function() {
                // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        _setupEvents: function() {
            this.connect(this.domNode, "click", function() {
                mx.data.action({
                    params: {
                        applyto: "selection",
                        actionname: this.actionMicroflow,
                        guids: [ this._contextObj.getGuid() ]
                    },
                    callback: function(obj) {
                        // TODO what to do when all is ok!
                    },
                    error: function(error) {
                        console.log(this.id + ": An error occurred while executing microflow: " + error.description);
                    }
                }, this);
            });
        },

        _updateCounter: function() {
            this._getNotificationCount();
        },

        _updateRendering: function() {
            // Update Notification counter

            if (this.counterNode === null) {
                // this.connect(this.domNode, 'onclick', dojo.hitch(this, this.execaction, this.microflow));
                this.counterNode = mxui.dom.div({
                    class: "NotificationCenter-counter"
                });

                if (this._notificationCount > 0) {
                    mxui.dom.html(this.counterNode, this._notificationCount);
                    dojo.addClass(this.counterNode, "NotificationCenter-hasnewmessages");
                } else {
                    dojo.removeClass(this.counterNode, "NotificationCenter-hasnewmessages");
                }

                this.imgNode = mxui.dom.a({ class: "" }, this.counterNode);
                this.domNode.appendChild(this.imgNode);
                dojo.attr(this.imgNode, "class", "");
            } else if (this._notificationCount > 0) {
                mxui.dom.html(this.counterNode, this._notificationCount);
                dojo.addClass(this.counterNode, "NotificationCenter-hasnewmessages");
            } else {
                dojo.removeClass(this.counterNode, "NotificationCenter-hasnewmessages");
            }
        },

        _getNotificationCount: function() {
                // Fetch Notification count by microflow
            var self = this;

            mx.data.action({
                params: {
                    actionname: this.counterMicroflow,
                    guids: [ this._contextObj.getGuid() ]
                },
                callback: function(count) {
                    self._notificationCount = count;
                    self._updateRendering();
                },
                error: function(error) {
                    console.log(this.id + ": An error occurred while executing microflow: " + error.description);
                }
            });
        },

        _resetSubscriptions: function() {
                // Release handle on previous object, if any.
            if (this._handle) {
                this.unsubscribe(this._handle);
                this._handle = null;
            }

            if (this._contextObj) {
                this._handle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: this._updateCounter
                });
            }
        }
    });
});

require([ "NotificationsWidget/widget/NotificationsWidget" ]);
