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

define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase"
], function(declare, _WidgetBase) {
    "use strict";

    return declare("NotificationsWidget.widget.NotificationsWidget", [ _WidgetBase ], {
        _notificationCount: null,

        // Internal variables
        _handle: null,
        _contextObj: null,
        _objProperty: null,

        postCreate: function() {
            console.log(this.id + ".postCreate");
            this.domNode.title = this.tooltipCaption;
            this._setupEvents();
        },

        update: function(obj, callback) {
            console.log(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateCounter();

            callback();
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

            if (this.counterNode == null) {
                this.counterNode = mxui.dom.div({
                    "class": "NotificationCenter-counter"
                });

                if (this._notificationCount > 0) {
                    mxui.dom.html(this.counterNode, this._notificationCount);
                    dojo.addClass(this.counterNode, "NotificationCenter-hasnewmessages");
                } else {
                    dojo.removeClass(this.counterNode, "NotificationCenter-hasnewmessages");
                }

                this.imgNode = mxui.dom.a({ "class": "" }, this.counterNode);
                this.domNode.appendChild(this.imgNode);
                dojo.attr(this.imgNode, "class", "");
            } else {
                if (this._notificationCount > 0) {
                    mxui.dom.html(this.counterNode, this._notificationCount);
                    dojo.addClass(this.counterNode, "NotificationCenter-hasnewmessages");
                } else {
                    dojo.removeClass(this.counterNode, "NotificationCenter-hasnewmessages");
                }
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
