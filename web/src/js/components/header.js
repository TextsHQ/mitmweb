import React from "react";
import ReactDOM from 'react-dom';
import $ from "jquery";

import Filt from "../filt/filt.js";
import {Key} from "../utils.js";
import {ToggleInputButton, ToggleButton} from "./common.js";
import {SettingsActions, FlowActions} from "../actions.js";
import {Query} from "../actions.js";
import {SettingsState} from "./common.js";

var FilterDocs = React.createClass({
    statics: {
        xhr: false,
        doc: false
    },
    componentWillMount: function () {
        if (!FilterDocs.doc) {
            FilterDocs.xhr = $.getJSON("/filter-help").done(function (doc) {
                FilterDocs.doc = doc;
                FilterDocs.xhr = false;
            });
        }
        if (FilterDocs.xhr) {
            FilterDocs.xhr.done(function () {
                this.forceUpdate();
            }.bind(this));
        }
    },
    render: function () {
        if (!FilterDocs.doc) {
            return <i className="fa fa-spinner fa-spin"></i>;
        } else {
            var commands = FilterDocs.doc.commands.map(function (c) {
                return <tr key={c[1]}>
                    <td>{c[0].replace(" ", '\u00a0')}</td>
                    <td>{c[1]}</td>
                </tr>;
            });
            commands.push(<tr key="docs-link">
                <td colSpan="2">
                    <a href="http://docs.mitmproxy.org/en/stable/features/filters.html"
                        target="_blank">
                        <i className="fa fa-external-link"></i>
                    &nbsp; mitmproxy docs</a>
                </td>
            </tr>);
            return <table className="table table-condensed">
                <tbody>{commands}</tbody>
            </table>;
        }
    }
});
var FilterInput = React.createClass({
    contextTypes: {
        returnFocus: React.PropTypes.func
    },
    getInitialState: function () {
        // Consider both focus and mouseover for showing/hiding the tooltip,
        // because onBlur of the input is triggered before the click on the tooltip
        // finalized, hiding the tooltip just as the user clicks on it.
        return {
            value: this.props.value,
            focus: false,
            mousefocus: false
        };
    },
    componentWillReceiveProps: function (nextProps) {
        this.setState({value: nextProps.value});
    },
    onChange: function (e) {
        var nextValue = e.target.value;
        this.setState({
            value: nextValue
        });
        // Only propagate valid filters upwards.
        if (this.isValid(nextValue)) {
            this.props.onChange(nextValue);
        }
    },
    isValid: function (filt) {
        try {
            var str = filt || this.state.value;
            if(str){
                Filt.parse(filt || this.state.value);
            }
            return true;
        } catch (e) {
            return false;
        }
    },
    getDesc: function () {
        if(this.state.value) {
            try {
                return Filt.parse(this.state.value).desc;
            } catch (e) {
                return "" + e;
            }
        }
        return <FilterDocs/>;
    },
    onFocus: function () {
        this.setState({focus: true});
    },
    onBlur: function () {
        this.setState({focus: false});
    },
    onMouseEnter: function () {
        this.setState({mousefocus: true});
    },
    onMouseLeave: function () {
        this.setState({mousefocus: false});
    },
    onKeyDown: function (e) {
        if (e.keyCode === Key.ESC || e.keyCode === Key.ENTER) {
            this.blur();
            // If closed using ESC/ENTER, hide the tooltip.
            this.setState({mousefocus: false});
        }
        e.stopPropagation();
    },
    blur: function () {
        ReactDOM.findDOMNode(this.refs.input).blur();
        this.context.returnFocus();
    },
    select: function () {
        ReactDOM.findDOMNode(this.refs.input).select();
    },
    render: function () {
        var isValid = this.isValid();
        var icon = "fa fa-fw fa-" + this.props.type;
        var groupClassName = "filter-input input-group" + (isValid ? "" : " has-error");

        var popover;
        if (this.state.focus || this.state.mousefocus) {
            popover = (
                <div className="popover bottom" onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
                    <div className="arrow"></div>
                    <div className="popover-content">
                    {this.getDesc()}
                    </div>
                </div>
            );
        }

        return (
            <div className={groupClassName}>
                <span className="input-group-addon">
                    <i className={icon} style={{color: this.props.color}}></i>
                </span>
                <input type="text" placeholder={this.props.placeholder} className="form-control"
                    ref="input"
                    onChange={this.onChange}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    onKeyDown={this.onKeyDown}
                    value={this.state.value}/>
                {popover}
            </div>
        );
    }
});

export var MainMenu = React.createClass({
    propTypes: {
        settings: React.PropTypes.object.isRequired,
    },
    statics: {
        title: "Start",
        route: "flows"
    },
    onSearchChange: function (val) {
        var d = {};
        d[Query.SEARCH] = val;
        this.props.updateLocation(undefined, d);
    },
    onHighlightChange: function (val) {
        var d = {};
        d[Query.HIGHLIGHT] = val;
        this.props.updateLocation(undefined, d);
    },
    onInterceptChange: function (val) {
        SettingsActions.update({intercept: val});
    },
    render: function () {
        var search = this.props.query[Query.SEARCH] || "";
        var highlight = this.props.query[Query.HIGHLIGHT] || "";
        var intercept = this.props.settings.intercept || "";

        return (
            <div>
                <div className="menu-row">
                    <FilterInput
                        ref="search"
                        placeholder="Search"
                        type="search"
                        color="black"
                        value={search}
                        onChange={this.onSearchChange} />
                    <FilterInput
                        ref="highlight"
                        placeholder="Highlight"
                        type="tag"
                        color="hsl(48, 100%, 50%)"
                        value={highlight}
                        onChange={this.onHighlightChange}/>
                    <FilterInput
                        ref="intercept"
                        placeholder="Intercept"
                        type="pause"
                        color="hsl(208, 56%, 53%)"
                        value={intercept}
                        onChange={this.onInterceptChange}/>
                </div>
                <div className="clearfix"></div>
            </div>
        );
    }
});


var ViewMenu = React.createClass({
    statics: {
        title: "View",
        route: "flows"
    },
    toggleEventLog: function () {
        var d = {};
        if (this.props.query[Query.SHOW_EVENTLOG]) {
            d[Query.SHOW_EVENTLOG] = undefined;
        } else {
            d[Query.SHOW_EVENTLOG] = "t"; // any non-false value will do it, keep it short
        }

        this.props.updateLocation(undefined, d);
        console.log('toggleevent');
    },
    render: function () {
      var showEventLog = this.props.query[Query.SHOW_EVENTLOG];
      return (
          <div>
            <div className="menu-row">
              <ToggleButton
                checked={showEventLog}
                name = "Show Eventlog"
                onToggleChanged={this.toggleEventLog}/>
            </div>
            <div className="clearfix"></div>
          </div>
      );
    }
});

export const OptionMenu = (props) => {
    const {mode, intercept, showhost, no_upstream_cert, rawtcp, http2, anticache, anticomp, stickycookie, stickyauth, stream} = props.settings;
    return (
        <div>
            <div className="menu-row">
                <ToggleButton name="showhost"
                              checked={showhost}
                              onToggleChanged={() => SettingsActions.update({showhost: !showhost})}
                />
                <ToggleButton name="no_upstream_cert"
                              checked={no_upstream_cert}
                              onToggleChanged={() => SettingsActions.update({no_upstream_cert: !no_upstream_cert})}
                />
                <ToggleButton name="rawtcp"
                              checked={rawtcp}
                              onToggleChanged={() => SettingsActions.update({rawtcp: !rawtcp})}
                />
                <ToggleButton name="http2"
                              checked={http2}
                              onToggleChanged={() => SettingsActions.update({http2: !http2})}
                />
                <ToggleButton name="anticache"
                              checked={anticache}
                              onToggleChanged={() => SettingsActions.update({anticache: !anticache})}
                />
                <ToggleButton name="anticomp"
                              checked={anticomp}
                              onToggleChanged={() => SettingsActions.update({anticomp: !anticomp})}
                />
                <ToggleInputButton name="stickyauth" placeholder="Sticky auth filter"
                    checked={Boolean(stickyauth)}
                    txt={stickyauth || ""}
                    onToggleChanged={txt => SettingsActions.update({stickyauth: (!stickyauth ? txt : null)})}
                />
                <ToggleInputButton name="stickycookie" placeholder="Sticky cookie filter"
                    checked={Boolean(stickycookie)}
                    txt={stickycookie || ""}
                    onToggleChanged={txt => SettingsActions.update({stickycookie: (!stickycookie ? txt : null)})}
                />
                <ToggleInputButton name="stream" placeholder="stream..."
                    checked={Boolean(stream)}
                    txt={stream || ""}
                    inputType = "number"
                    onToggleChanged={txt => SettingsActions.update({stream: (!stream ? txt : null)})}
                />
            </div>
            <div className="clearfix"/>
        </div>
    );
};
OptionMenu.title = "Options";

OptionMenu.propTypes = {
    settings: React.PropTypes.object.isRequired
};

var ReportsMenu = React.createClass({
    statics: {
        title: "Visualization",
        route: "reports"
    },
    render: function () {
        return <div>Reports Menu</div>;
    }
});

var FileMenu = React.createClass({
    getInitialState: function () {
        return {
            showFileMenu: false
        };
    },
    handleFileClick: function (e) {
        e.preventDefault();
        if (!this.state.showFileMenu) {
            var close = function () {
                this.setState({showFileMenu: false});
                document.removeEventListener("click", close);
            }.bind(this);
            document.addEventListener("click", close);

            this.setState({
                showFileMenu: true
            });
        }
    },
    handleNewClick: function (e) {
        e.preventDefault();
        if (confirm("Delete all flows?")) {
            FlowActions.clear();
        }
    },
    handleOpenClick: function (e) {
        this.fileInput.click();
        e.preventDefault();
    },
    handleOpenFile: function (e) {
        if (e.target.files.length > 0) {
            FlowActions.upload(e.target.files[0]);
            this.fileInput.value = "";
        }
        e.preventDefault();
    },
    handleSaveClick: function (e) {
        e.preventDefault();
        FlowActions.download();
    },
    handleShutdownClick: function (e) {
        e.preventDefault();
        console.error("unimplemented: handleShutdownClick");
    },
    render: function () {
        var fileMenuClass = "dropdown pull-left" + (this.state.showFileMenu ? " open" : "");

        return (
            <div className={fileMenuClass}>
                <a href="#" className="special" onClick={this.handleFileClick}> mitmproxy </a>
                <ul className="dropdown-menu" role="menu">
                    <li>
                        <a href="#" onClick={this.handleNewClick}>
                            <i className="fa fa-fw fa-file"></i>
                            New
                        </a>
                    </li>
                    <li>
                        <a href="#" onClick={this.handleOpenClick}>
                         <i className="fa fa-fw fa-folder-open"></i>
                            Open...
                        </a>
                         <input ref={(ref) => this.fileInput = ref}  className="hidden" type="file" onChange={this.handleOpenFile}/>

                    </li>
                    <li>
                        <a href="#" onClick={this.handleSaveClick}>
                            <i className="fa fa-fw fa-floppy-o"></i>
                            Save...
                        </a>
                    </li>
                    <li role="presentation" className="divider"></li>
                    <li>
                        <a href="http://mitm.it/" target="_blank">
                            <i className="fa fa-fw fa-external-link"></i>
                            Install Certificates...
                        </a>
                    </li>
                {/*
                 <li role="presentation" className="divider"></li>
                 <li>
                 <a href="#" onClick={this.handleShutdownClick}>
                 <i className="fa fa-fw fa-plug"></i>
                 Shutdown
                 </a>
                 </li>
                 */}
                </ul>
            </div>
        );
    }
});


var header_entries = [MainMenu, ViewMenu, OptionMenu /*, ReportsMenu */];


export var Header = React.createClass({
    propTypes: {
        settings: React.PropTypes.object.isRequired,
    },
    getInitialState: function () {
        return {
            active: header_entries[0]
        };
    },
    handleClick: function (active, e) {
        e.preventDefault();
        this.props.updateLocation(active.route);
        this.setState({active: active});
    },
    render: function () {
        var header = header_entries.map(function (entry, i) {
            var className;
            if (entry === this.state.active) {
                className = "active";
            } else {
                className = "";
            }
            return (
                <a key={i}
                    href="#"
                    className={className}
                    onClick={this.handleClick.bind(this, entry)}>
                    {entry.title}
                </a>
            );
        }.bind(this));

        return (
            <header>
                <nav className="nav-tabs nav-tabs-lg">
                    <FileMenu/>
                    {header}
                </nav>
                <div className="menu">
                    <this.state.active
                        settings={this.props.settings}
                        updateLocation={this.props.updateLocation}
                        query={this.props.query}
                    />
                </div>
            </header>
        );
    }
});
