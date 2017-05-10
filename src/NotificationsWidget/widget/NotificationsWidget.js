/*
    NotificationsWidget
    ========================

    @file      : NotificationsWidget.js
    @version   : 0.2
    @author    : Mansystems
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
    @version: 0.2
    @author: Mansystems
*/

define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dojo/dom-class",
    "dojo/html"
], function(declare, _WidgetBase, domClass, html) {
    "use strict";

    return declare("NotificationsWidget.widget.NotificationsWidget", [ _WidgetBase ], {
        _notificationCount: null,

        // Internal variables
        _handle: null,
        _contextObj: null,
        _objProperty: null,

        postCreate: function() {
            this.domNode.title = this.tooltipCaption;
        },

        update: function(obj, callback) {
            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateCounter();
            this._setupEvents();
            callback();
        },

        _setupEvents: function() {
            var self = this;
            if (this._contextObj) {
                this.connect(this.domNode, "click", function() {
                    mx.data.action({
                        params: {
                            applyto: "selection",
                            actionname: this.actionMicroflow,
                            guids: [ this._contextObj.getGuid() ],
                            origin: this.mxform
                        },
                        callback: function(obj) {
                        },
                        error: function(error) {
                            mx.ui.error("An error occurred while executing microflow " + this.actionMicroflow + " : " + error.description);
                        }
                    }, this);
                });
            }
        },

        _updateCounter: function() {
            this._getNotificationCount();
        },

        _updateRendering: function() {
            // Update Notification counter
            if (this.counterNode == null) {
                this.counterNode = mxui.dom.create("div", {
                    class: "NotificationCenter-counter"
                });

                if (this._notificationCount > 0) {
                    html.set(this.counterNode, this._notificationCount);
                    domClass.add(this.counterNode, "NotificationCenter-hasnewmessages");
                } else {
                    domClass.remove(this.counterNode, "NotificationCenter-hasnewmessages");
                }

                this.imgNode = mxui.dom.create("a", { class: "" }, this.counterNode);
                this.domNode.appendChild(this.imgNode);
                dojo.attr(this.imgNode, "class", "");
            } else if (this._notificationCount > 0) {
                html.set(this.counterNode, this._notificationCount);
                domClass.add(this.counterNode, "NotificationCenter-hasnewmessages");
            } else {
                domClass.remove(this.counterNode, "NotificationCenter-hasnewmessages");
            }
        },

        _getNotificationCount: function() {
            // Fetch Notification count by microflow
            var self = this;
            if (this._contextObj) {
                mx.data.action({
                    params: {
                        applyto: "selection",
                        actionname: this.counterMicroflow,
                        guids: [ this._contextObj.getGuid() ],
                        origin: this.mxform
                    },
                    callback: function(count) {
                        self._notificationCount = count;
                        self._updateRendering();
                    },
                    error: function(error) {
                        mx.ui.error("An error occurred while executing microflow " + this.counterMicroflow + " : " + error.description);
                    }
                }, this);
            }
        },

        _resetSubscriptions: function() {
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
