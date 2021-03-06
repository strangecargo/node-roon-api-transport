"use strict";

let SVCNAME = "com.roonlabs.transport:2";

function oid(o) {
    if (typeof(o) == 'string') return o;
    return o.output_id;
}
function zoid(zo) {
    if (typeof(zo) == 'string') return zo;
    if (zo.output_id) return zo.output_id;
    return zo.zone_id;
}

/**
 * Roon API Transport Service: Zone
 * @class Zone
 * @property {string}  zone_id
 * @property {string}  display_name - Display Name for this zone
 * @property {Output[]}  ouputs - The outputs in this zone
 * @property {('playing'|'paused'|'loading'|'stopped')} state
 * @property {number} [seek_position] - Current seek position for the zone
 * @property {boolean} is_previous_allowed - Indicates whether the "previous" control is supported
 * @property {boolean} is_next_allowed - Indicates whether the "next" control is supported
 * @property {boolean} is_pause_allowed - Indicates whether the "pause" control is supported
 * @property {boolean} is_play_allowed - Indicates whether the "play" control is supported
 * @property {boolean} is_seek_allowed - Indicates whether the "seek" control is supported
 * @property {number} [queue_items_remaining] - Number of items in the play queue for this zone
 * @property {number} [queue_time_remaining] - Number of seconds remaining in the play queue for this zone
 * @property {object}  [settings]               - The default values for parties.
 * @property {('loop'|'loop_one'|'disabled')} settings.loop - loop setting on the zone
 * @property {boolean}  settings.shuffle - indicates whether shuffle is enabled on the zone
 * @property {boolean}  settings.auto_radio - indicates whether auto-radio mode is enabled on the zone
 * @property {object}  [now_playing] - Now-playing information for this zone, if playback is active
 * @property {number}  [now_playing.seek_position] - Seek Position in seconds, if applicable
 * @property {number}  [now_playing.length] - Length of media in seconds, if applicable
 * @property {string}  [now_playing.image_key] - Now-playing image
 * @property {object}  now_playing.one_line - Display text for one-line displays
 * @property {string}  now_playing.one_line.line1
 * @property {object}  now_playing.two_line - Display text for two-line displays
 * @property {string}  now_playing.two_line.line1
 * @property {string}  [now_playing.two_line.line2]
 * @property {object}  now_playing.three_line - Display text for three-line displays
 * @property {string}  now_playing.three_line.line1
 * @property {string}  [now_playing.three_line.line2]
 * @property {string}  [now_playing.three_line.line3]

 */

/**
 * Roon API Transport Service: Output
 * @class Output
 * @property {string}  output_id
 * @property {string}  zone_id - The zone that this output is a part of
 * @property {string}  display_name - Display Name for this output
 * @property {('playing'|'paused'|'loading'|'stopped')} state
 * @property {object}  [source_controls]               - The default values for parties.
 * @property {string}  source_controls.display_name - Display Name for this source control
 * @property {('selected'|'deselected'|'standby'|'indeterminate')} source_controls.status
 * @property {boolean}  source_controls.supports_standby - true if this source control supports standby
 *
 * @property {object}  [volume] - This field is populated for outputs that support volume control.<p style='white-space: pre-wrap;'>
 * Note that volume values, bounds, and step are floating point values, not integers, and that volume ranges can extend below and above zero, sometimes at the same time.
 *
 * Examples:
 *
 * This list of examples is not meant to be exhaustive--it just serves to create a sense of the range of options out there.
 * <pre>
 *     { "type": "db",    "min": -80, "max": 0,   "value": -50.5, "step": 0.5 }
 *     { "type": "db",    "min": -80, "max": 10,  "value": 4,     "step": 1.0 }
 *     { "type": "number" "min": 0,   "max": 100, "value": 80,    "step": 1.0 }
 *     { "type": "number" "min": 1,   "max": 99,  "value": 65,    "step": 1.0 }
 *     { "type": "incremental" }
 * </pre>
 * </pre>
 * @property {('number'|'db'|'incremental'|*)}  [volume.type] - If you receive an unanticipated value for this, treat it like "number".  The "incremental" type represents a volume control that just has "+" and "-" buttons, with no feedback about the current volume value or its range. It might be used in conjunction with an IR blaster, for example. In this case, all of the remaining properties (min,max,step,value,is_muted,limits) will be absent. With an "incremental" control, you should display two buttons, and when issuing change_volume requests, use "relative" mode and only send adjustments of +1/-1.
 * @property {number}  [volume.min] - The minimum value in the volume range
 * @property {number}  [volume.max] - The maximum value in the volume range
 * @property {number}  [volume.value] - The current value of the volume control
 * @property {number}  [volume.step] - The step size for the volume control, in terms of its native units
 * @property {boolean}  [volume.is_muted] - True if the zone is muted, false otherwise
 */

/**
 * Roon API Transport Service
 * @class RoonApiTransport
 * @param {Core} core - The Core providing the service
 */
function RoonApiTransport(core) {
    this.core = core;
    this._queues = { };
}

RoonApiTransport.services = [ { name: SVCNAME } ];

/**
 * Mute/unmute all zones (that are mutable).
 * @param {('mute'|'unmute')} how - The action to take
 * @param {RoonApiTransport~resultcallback} [cb] - Called on success or error
 */
RoonApiTransport.prototype.mute_all = function(how, cb) {
    this.core.moo.send_request(SVCNAME+"/mute_all",
                               {
                                   how:       how
                               },
                               (msg, body) => {
                                   if (cb)
                                       cb(msg && msg.name == "Success" ? false : (msg ? msg.name : "NetworkError"));
                               });
};
/**
 * Pause all zones.
 * @param {RoonApiTransport~resultcallback} [cb] - Called on success or error
 */
RoonApiTransport.prototype.pause_all = function(cb) {
    this.core.moo.send_request(SVCNAME+"/pause_all",
                               (msg, body) => {
                                   if (cb)
                                       cb(msg && msg.name == "Success" ? false : (msg ? msg.name : "NetworkError"));
                               });
};
/**
 * Standby an output.
 *
 * @param {Output} output - The output to put into standby
 * @param {object} opts - Options. If none, specify empty object ({}).
 * @param {string} [opts.control_key] - The <tt>control_key</tt> that identifies the <tt>source_control</tt> that is to be put into standby. If omitted, then all source controls on this output that support standby will be put into standby.
 * @param {RoonApiTransport~resultcallback} [cb] - Called on success or error
 */
RoonApiTransport.prototype.standby = function(o, opts, cb) {
    if (!o) { if (cb) cb(false); return; }
    opts = Object.assign({ output_id: oid(o) }, opts);
    this.core.moo.send_request(SVCNAME+"/standby", opts,
                               (msg, body) => {
                                   if (cb)
                                       cb(msg && msg.name == "Success" ? false : (msg ? msg.name : "NetworkError"));
                               });
};
/**
 * Toggle the standby state of an output.
 *
 * @param {Output} output - The output that should have its standby state toggled.
 * @param {object} opts - Options. If none, specify empty object ({}).
 * @param {string} [opts.control_key] - The <tt>control_key</tt> that identifies the <tt>source_control</tt> that is to have its standby state toggled.
 * @param {RoonApiTransport~resultcallback} [cb] - Called on success or error
 */
RoonApiTransport.prototype.toggle_standby = function(o, opts, cb) {
    if (!o) { if (cb) cb(false); return; }
    opts = Object.assign({ output_id: oid(o) }, opts);
    this.core.moo.send_request(SVCNAME+"/toggle_standby", opts,
                               (msg, body) => {
                                   if (cb)
                                       cb(msg && msg.name == "Success" ? false : (msg ? msg.name : "NetworkError"));
                               });
};
/**
 * Cconvenience switch an output, taking it out of standby if needed.
 *
 * @param {Output} output - The output that should be convenience-switched.
 * @param {object} opts - Options. If none, specify empty object ({}).
 * @param {string} [opts.control_key] - The <tt>control_key</tt> that identifies the <tt>source_control</tt> that is to be switched. If omitted, then all controls on this output will be convenience switched.
 * @param {RoonApiTransport~resultcallback} [cb] - Called on success or error
 */
RoonApiTransport.prototype.convenience_switch = function(o, opts, cb) {
    if (!o) { if (cb) cb(false); return; }
    opts = Object.assign({ output_id: oid(o) }, opts);
    this.core.moo.send_request(SVCNAME+"/convenience_switch", opts,
                               (msg, body) => {
                                   if (cb)
                                       cb(msg && msg.name == "Success" ? false : (msg ? msg.name : "NetworkError"));
                               });
};
/**
 * Mute/unmute an output.
 * @param {Output} output - The output to mute.
 * @param {('mute'|'unmute')} how - The action to take
 * @param {RoonApiTransport~resultcallback} [cb] - Called on success or error
 */
RoonApiTransport.prototype.mute = function(output, how, cb) {
    if (!output) { if (cb) cb(false); return; }
    this.core.moo.send_request(SVCNAME+"/mute",
                               {
                                   output_id: oid(output),
                                   how:       how
                               },
                               (msg, body) => {
                                   if (cb)
                                       cb(msg && msg.name == "Success" ? false : (msg ? msg.name : "NetworkError"));
                               });
};
/**
 * Change the volume of an output. Grouped zones can have differently behaving
 * volume systems (dB, min/max, steps, etc..), so you have to change the volume
 * different for each of those outputs.
 *
 * @param {Output} output - The output to change the volume on.
 * @param {('absolute'|'relative'|'relative_step')} how - How to interpret the volume
 * @param {number} value - The new volume value, or the increment value or step
 * @param {RoonApiTransport~resultcallback} [cb] - Called on success or error
 */
RoonApiTransport.prototype.change_volume = function(output, how, value, cb) {
    if (!output) { if (cb) cb(false); return; }
    this.core.moo.send_request(SVCNAME+"/change_volume",
                               {
                                   output_id: oid(output),
                                   how:       how,
                                   value:     value
                               },
                               (msg, body) => {
                                   if (cb)
                                       cb(msg && msg.name == "Success" ? false : (msg ? msg.name : "NetworkError"));
                               });
};
/**
 * Seek to a time position within the now playing media
 * @param {Zone|Output} zone - The zone or output
 * @param {('relative'|'absolute')} how - How to interpret the target seek position
 * @param {number} seconds - The target seek position
 * @param {RoonApiTransport~resultcallback} [cb] - Called on success or error
 */
RoonApiTransport.prototype.seek = function(z, how, seconds, cb) {
    if (!z) { if (cb) cb(false); return; }
    this.core.moo.send_request(SVCNAME+"/seek",
                               {
                                   zone_or_output_id: zoid(z),
                                   how:             how,
                                   seconds:         seconds
                               },
                               (msg, body) => {
                                   if (cb)
                                       cb(msg && msg.name == "Success" ? false : (msg ? msg.name : "NetworkError"));
                               });
};
/**
 * Execute a transport control on a zone.
 *
 * <p>Be sure that `is_<control>_allowed` is true on your {Zone} before allowing the user to operate controls</p>
 *
 * @param {Zone|Output} zone - The zone or output
 * @param {('play'|'pause'|'playpause'|'stop'|'previous'|'next')} control - The control desired
 * <pre>
 * "play" - If paused or stopped, start playback
 * "pause" - If playing or loading, pause playback
 * "playpause" - If paused or stopped, start playback. If playing or loading, pause playback.
 * "stop" - Stop playback and release the audio device immediately
 * "previous" - Go to the start of the current track, or to the previous track
 * "next" - Advance to the next track
 * </pre>
 *
 * @param {RoonApiTransport~resultcallback} [cb] - Called on success or error
 */
RoonApiTransport.prototype.control = function(z, control, cb) {
    if (!z) { if (cb) cb(false); return; }
    this.core.moo.send_request(SVCNAME+"/control",
                               {
                                   zone_or_output_id: zoid(z),
                                   control:           control
                               },
                               (msg, body) => {
                                   if (cb)
                                       cb(msg && msg.name == "Success" ? false : (msg ? msg.name : "NetworkError"));
                               });
};
/**
 * Transfer the current queue from one zone to another
 *
 * @param {Zone|Output} fromzone - The source zone or output
 * @param {Zone|Output} tozone - The destination zone or output
 * @param {RoonApiTransport~resultcallback} [cb] - Called on success or error
 */
RoonApiTransport.prototype.transfer_zone = function(fromz, toz, cb) {
    if (!fromz || !toz) { if (cb) cb(false); return; }
    this.core.moo.send_request(SVCNAME+"/transfer_zone",
                               {
                                   from_zone_or_output_id: zoid(fromz),
                                   to_zone_or_output_id:   zoid(toz),
                               },
                               (msg, body) => {
                                   if (cb)
                                       cb(msg && msg.name == "Success" ? false : (msg ? msg.name : "NetworkError"));
                               });
};
/**
 * Create a group of synchronized audio outputs
 *
 * @param {Output[]} outputs - The outputs to group. The first output's zone's queue is preserved.
 * @param {RoonApiTransport~resultcallback} [cb] - Called on success or error
 */
RoonApiTransport.prototype.group_outputs = function(outputs, cb) {
    if (!outputs) { if (cb) cb(false); return; }
    this.core.moo.send_request(SVCNAME+"/group_outputs",
                               {
                                   output_ids: outputs.reduce((p,e) => p.push(oid(e)) && p, []),
                               },
                               (msg, body) => {
                                   if (cb)
                                       cb(msg && msg.name == "Success" ? false : (msg ? msg.name : "NetworkError"));
                               });
};
/**
 * Ungroup outputs previous grouped
 *
 * @param {Output[]} outputs - The outputs to ungroup.
 * @param {RoonApiTransport~resultcallback} [cb] - Called on success or error
 */
RoonApiTransport.prototype.ungroup_outputs = function(outputs, cb) {
    if (!outputs) { if (cb) cb(false); return; }
    this.core.moo.send_request(SVCNAME+"/ungroup_outputs",
                               {
                                   output_ids: outputs.reduce((p,e) => p.push(oid(e)) && p, []),
                               },
                               (msg, body) => {
                                   if (cb)
                                       cb(msg && msg.name == "Success" ? false : (msg ? msg.name : "NetworkError"));
                               });
};
/**
 * Change zone settings
 *
 * @param {Zone|Output} zone - The zone or output
 * @param {object} settings - The settings to change
 * @param {boolean} [settings.shuffle] - If present, sets shuffle mode to the specified value
 * @param {boolean} [settings.auto_radio] - If present, sets auto_radio mode to the specified value
 * @param {('loop'|'loop_one'|'disabled'|'next')} [settings.loop] - If present, sets loop mode to the specified value. 'next' will cycle between the settings.
 * @param {RoonApiTransport~resultcallback} [cb] - Called on success or error
 */
RoonApiTransport.prototype.change_settings = function(z, settings, cb) {
    if (!z) { if (cb) cb(false); return; }
    settings = Object.assign({ zone_or_output_id: zoid(z) }, settings);
    this.core.moo.send_request(SVCNAME+"/change_settings",
                               settings,
                               (msg, body) => {
                                   if (cb)
                                       cb(msg && msg.name == "Success" ? false : (msg ? msg.name : "NetworkError"));
                               });
};

RoonApiTransport.prototype.get_zones = function(cb) {
    this.core.moo.send_request(SVCNAME+"/get_zones",
                               (msg, body) => {
                                   if (cb)
                                       cb(msg && msg.name == "Success" ? false : (msg ? msg.name : "NetworkError"), body);
                               });
};
RoonApiTransport.prototype.get_outputs = function(cb) {
    this.core.moo.send_request(SVCNAME+"/get_outputs",
                               (msg, body) => {
                                   if (cb)
                                       cb(msg && msg.name == "Success" ? false : (msg ? msg.name : "NetworkError"), body);
                               });
};

RoonApiTransport.prototype.subscribe_outputs  = function(cb) { this.core.moo._subscribe_helper(SVCNAME, "outputs", cb); }
RoonApiTransport.prototype.subscribe_zones    = function(cb) {
    this.core.moo._subscribe_helper(SVCNAME, "zones",
                                    (response, msg) => {
                                        if (response == "Subscribed") {
                                            this._zones = msg.zones.reduce((p,e) => (p[e.zone_id] = e) && p, {});

                                        } else if (response == "Changed") {
                                            if (msg.zones_removed)      msg.zones_removed.forEach(e => delete(this._zones[e.zone_id]));
                                            if (msg.zones_added)        msg.zones_added  .forEach(e => this._zones[e.zone_id] = e);
                                            if (msg.zones_changed)      msg.zones_changed.forEach(e => this._zones[e.zone_id] = e);
                                            
                                            if (msg.zones_seek_changed) msg.zones_seek_changed.forEach(e => {
                                                let zone = this._zones[e.zone_id];
                                                if (zone == undefined) return;
                                                if (zone.now_playing != undefined) zone.now_playing.seek_position = e.seek_position
                                                zone.queue_time_remaining = e.queue_time_remaining;
                                            });
                                            
                                        } else if (response == "Unsubscribed") {
                                            delete(this._zones);
                                        }
                                        cb(response, msg);
                                    });
}

RoonApiTransport.prototype.subscribe_queue = function(zone_or_output, max_item_count, cb) {
    var zone_or_output_id = zoid(zone_or_output);
    return this.core.moo._subscribe_helper(SVCNAME, "queue",
                                           {
                                               zone_or_output_id: zone_or_output_id,
                                               max_item_count: max_item_count
                                           },
                                           (response, msg) => {
                                               cb(response, msg);
                                           });
}

RoonApiTransport.prototype.play_from_here = function(zone_or_output, queue_item_id, cb) {
    var zone_or_output_id = zoid(zone_or_output);
    var req_args = {
        zone_or_output_id: zone_or_output_id,
        queue_item_id: queue_item_id
    };
    this.core.moo.send_request(SVCNAME+"/play_from_here",
                               req_args,
                               (msg, body) => {
                                   if (cb)
                                       cb(msg, body);
                                   
                               });
}

RoonApiTransport.prototype.zone_by_zone_id = function(zone_id) {
    if (!this._zones) return null;
    for (var x in this._zones) if (x == zone_id) return this._zones[x];
    return null;
}
RoonApiTransport.prototype.zone_by_output_id = function(output_id) {
    if (!this._zones) return null;
    for (var x in this._zones) for (var y in this._zones[x].outputs) if (this._zones[x].outputs[y].output_id == output_id) return this._zones[x];
    return null;
}
RoonApiTransport.prototype.zone_by_object = function(zone_or_output) {
    if (zone_or_output.zone_id)   return this.zone_by_zone_id  (zone_or_output.zone_id);
    if (zone_or_output.output_id) return this.zone_by_output_id(zone_or_output.output_id);
    return null;
}

exports = module.exports = RoonApiTransport;
