import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider } from '@material-ui/core/styles';

import Connection from "@iobroker/adapter-react/Connection";
import Loader from "@iobroker/adapter-react/Components/Loader";
import { PROGRESS } from "@iobroker/adapter-react/Connection";
import I18n from "@iobroker/adapter-react/i18n";
import GenericApp from "@iobroker/adapter-react/GenericApp";

import Layout from "./components/Layout";

// Icons

const styles = theme => ({
	root: {},
	logo: {
		width: 32,
		height: 32,
		padding: theme.spacing(1),
		display: "inline-block"
	}
});

class App extends GenericApp {
	constructor(props) {
		super(props);
		this.translations = {
			en: require("./i18n/en"),
			de: require("./i18n/de"),
			ru: require("./i18n/ru"),
			pt: require("./i18n/pt"),
			nl: require("./i18n/nl"),
			fr: require("./i18n/fr"),
			it: require("./i18n/it"),
			es: require("./i18n/es"),
			pl: require("./i18n/pl"),
			"zh-cn": require("./i18n/zh-cn")
		};

		// init translations
		I18n.setTranslations(this.translations);
		I18n.setLanguage(
			(navigator.language || navigator.userLanguage || "en")
				.substring(0, 2)
				.toLowerCase()
		);
		this.adapterName = "text2command";
	}

	readConfig() {
		return this.socket
			.getObject("system.adapter." + this.adapterName + "." + this.instance)
			.then(config => {
				const native = config.native || {};
				native.rules = native.rules || [];
				native.sayitInstance = native.sayitInstance || "";
				native.language = native.language || "";
				native.processorId = native.processorId || "";
				native.processorTimeout = native.processorTimeout || 1000;
				return native;
			});
	}

	saveConfig(config) {
		return this.socket
			.getObject("system.adapter." + this.adapterName + "." + this.instance)
			.then(obj => {
				if (JSON.stringify(obj.native) !== JSON.stringify(config)) {
					obj.native = config;
					return this.socket.setObject(
						"system.adapter." + this.adapterName + "." + this.instance,
						obj
					);
				}
			});
	}

	componentDidMount() {
		this.port = window.location.port === "3000" ? 8081 : window.location.port;

		this.socket = new Connection({
			name: this.adapterName,
			onProgress: progress => {
				if (progress === PROGRESS.CONNECTING) {
					this.setState({
						connected: false
					});
				} else if (progress === PROGRESS.READY) {
					this.setState({
						connected: true,
						progress: 100
					});
				} else {
					this.setState({
						connected: true,
						progress: Math.round((PROGRESS.READY / progress) * 100)
					});
				}
			},
			port: this.port,
			onReady: async (objects, scripts) => {
				I18n.setLanguage(this.socket.systemLang);

				console.log(objects);
				console.log(scripts);
				const newState = {
					lang: this.socket.systemLang,
					ready: true
				};

				try {
					newState.systemConfig = await this.socket.getSystemConfig();
				} catch (error) {
					console.log(error);
				}

				this.readConfig()
					.then(config => {
						console.log(config);
						this.setState({ config });
					});
			},
			onError: error => {
				console.error(error);
				this.showError(error);
			}
		});
	}

	render() {
		if (!this.state.config) {
			return <MuiThemeProvider theme={ this.state.theme }>
				<Loader theme={this.state.themeType} />
			</MuiThemeProvider>;
		}

		return (
			<MuiThemeProvider theme={ this.state.theme }>
				<div className="App">
					{/* { // just an example
						this.state.config.rules.map(rule => <div className={ this.props.classes.rule}>
							{ JSON.stringify(rule) }
						</div>)
					} */}
					<Layout socket={this.socket} />
					{this.renderError()}
				</div>
			</MuiThemeProvider>
		);
	}
}

export default withStyles(styles)(App);
