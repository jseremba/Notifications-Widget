/*
    NotificationsWidget
    ========================

    @file      : NotificationsWidget.js
    @version   : 0.2.1
    @author    : Mansystems
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
    @version: 0.2.1
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
        // Parameters from the Modeler
        actionMicroflow: "",
        counterMicroflow: "",
        tooltipCaption: "",

        // Internal variables
        _notificationCount: null,
        _handle: null,
        _contextObject: null,
        _objProperty: null,

        postCreate: function() {
            this.domNode.title = this.tooltipCaption;
            this._setupEvents();
        },

        update: function(mxObject, callback) {
            this._contextObject = mxObject;
            this._resetSubscriptions();
            this._getNotificationCount();

            if (callback) {
                callback();
            }
        },

        _setupEvents: function() {
            this.connect(this.domNode, "click", function() {
                if (this._contextObject) {
                    mx.ui.action(this.actionMicroflow, {
                        context: this.mxcontext,
                        origin: this.mxform,
                        error: function(error) {
                            mx.ui.error("An error occurred while executing microflow " + this.actionMicroflow + " : " + error.message);
                        }
                    }, this);
                }
            });
        },

        _updateRendering: function() {
            // Update Notification counter
            if (!this.counterNode) {
                this.counterNode = mxui.dom.create("div", {
                    class: "NotificationCenter-counter"
                });

                if (this._notificationCount > 0) {
                    html.set(this.counterNode, this._notificationCount);
                    domClass.add(this.counterNode, "NotificationCenter-hasnewmessages");
                } else {
                    domClass.remove(this.counterNode, "NotificationCenter-hasnewmessages");
                }

                this.imgNode = mxui.dom.create("a", {}, this.counterNode);
                this.domNode.appendChild(this.imgNode);
            } else if (this._notificationCount > 0) {
                html.set(this.counterNode, this._notificationCount);
                domClass.add(this.counterNode, "NotificationCenter-hasnewmessages");
            } else {
                domClass.remove(this.counterNode, "NotificationCenter-hasnewmessages");
            }
        },

        _getNotificationCount: function() {
            // Fetch Notification count by microflow
            if (this._contextObject) {
                mx.ui.action(this.counterMicroflow, {
                    context: this.mxcontext,
                    origin: this.mxform,
                    callback: function(count) {
                        this._notificationCount = count;
                        this._updateRendering();
                    },
                    error: function(error) {
                        mx.ui.error("An error occurred while executing microflow " + this.counterMicroflow + " : " + error.message);
                    }
                }, this);
            }
        },

        _resetSubscriptions: function() {
            if (this._handle) {
                this.unsubscribe(this._handle);
                this._handle = null;
            }

            if (this._contextObject) {
                this._handle = this.subscribe({
                    guid: this._contextObject.getGuid(),
                    callback: this._getNotificationCount
                });
            }
        }
    });
});

require([ "NotificationsWidget/widget/NotificationsWidget" ]);
