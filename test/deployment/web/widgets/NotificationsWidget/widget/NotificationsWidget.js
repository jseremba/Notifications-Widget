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
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/_base/event",
    "dojo/dom-attr"
], function(declare, _WidgetBase,
    dom, dojoDom, dojoProp, dojoGeometry,
    dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText5, dojoEvent, domAttr) {
    "use strict";

    // Declare widget's prototype.
    return declare("NotificationsWidget.widget.NotificationsWidget", [ _WidgetBase ], {

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,
        _alertDiv: null,
        _readOnly: false,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function() {
            logger.debug(this.id + ".constructor");
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function() {
            logger.debug(this.id + ".postCreate");

            // this.domNode.appendChild(dom.create('span', { 'class': 'notificationswidget-message' }, 'internal property as constant: ' + this.messageString));
            this.domNode.title = this.tooltipCaption;
            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateCounter();

            callback();
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
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
                    callback: function() {
                        // TODO what to do when all is ok!
                    },
                    error: function(error) {
                        logger.debug(this.id + ": An error occurred while executing microflow: " + error.description);
                    }
                }, this);
            });
        },

        _updateCounter: function() {
            this._getNotificationCount();
        },

        // Rerender the interface.
        _updateRendering: function() {
            // Update Notification counter

            if (this.counterNode === null) {
                // this.connect(this.domNode, 'onclick', dojo.hitch(this, this.execaction, this.microflow));
                this.counterNode = mxui.dom.div({
                    class: "NotificationCenter-counter"
                });

                if (this._notificationCount > 0) {
                    mxui.dom.html(this.counterNode, this._notificationCount);
                    dojoClass.addClass(this.counterNode, "NotificationCenter-hasnewmessages");
                } else {
                    dojoClass.removeClass(this.counterNode, "NotificationCenter-hasnewmessages");
                }

                this.imgNode = mxui.dom.a({ class: "" }, this.counterNode);
                this.domNode.appendChild(this.imgNode);
                domAttr.attr(this.imgNode, "class", "");
            } else if (this._notificationCount > 0) {
                mxui.dom.html(this.counterNode, this._notificationCount);
                dojoClass.addClass(this.counterNode, "NotificationCenter-hasnewmessages");
            } else {
                dojoClass.removeClass(this.counterNode, "NotificationCenter-hasnewmessages");
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
                    logger.debug(this.id + ": An error occurred while executing microflow: " + error.description);
                }
            });
        },

        // Reset subscriptions.
        _resetSubscriptions: function() {
            logger.debug(this.id + "._resetSubscriptions");
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
