import React, { Component } from 'react';
import './App.css';

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			data: {
				items: []
			},
			searchTerm: '',
			typingTimeout: 0,
		};
		this.onTyping = this.onTyping.bind(this);
		this.callApi = this.callApi.bind(this);
	}

	componentDidMount() {
		this.callApi();
	}

	onTyping(e) {
		const self = this;
		if (this.state.typingTimeout) {
			clearTimeout(this.state.typingTimeout);
		}
		this.setState({
			searchTerm: e.target.value,
			typingTimeout: setTimeout(() => {
					self.callApi();
				}, 300),
		})
	}

	callApi() {
		var proxyUrl = 'https://cors-anywhere.herokuapp.com/',
			targetUrl = `https://www.flickr.com/services/feeds/photos_public.gne?format=json&nojsoncallback=true`
		fetch(proxyUrl + targetUrl)
		.then(blob => blob.json())
		.then(data => {
			this.setState({
				data: this.filterContent(data.items, this.state.searchTerm),
			});
		})
		.catch(e => {
			console.log(e);
		});
	}

	filterContent(data = [], searchTerm = '') {
		if (!searchTerm) return data;
		searchTerm = searchTerm.trim();
		const result = data.filter(item => this.includesTag(item, searchTerm) || this.includesAuthor(item, searchTerm) || this.includesImgOrHiResImg(item, searchTerm));
		return result;
	}

	includesTag(item = { tags: ''}, searchTerm = '') {
		searchTerm = searchTerm.toLowerCase();
		return item.tags.toLowerCase().includes(searchTerm);
	}

	includesAuthor(item = { author: ''}, searchTerm = '') {
		searchTerm = searchTerm.toLowerCase();
		return item.author.toLowerCase().includes(searchTerm);
	}

	includesImgOrHiResImg(item = { description: '' }, searchTerm = '') {
		const includeInformationPart = item.description.slice(item.description.indexOf('</p>'));
		const hiResImgPart = includeInformationPart.slice(0, includeInformationPart.indexOf('</a>'));
		const imgPart = includeInformationPart.slice(includeInformationPart.indexOf('<img'));

		const hiResImgLink = hiResImgPart.split('"')[1];
		const imgLink = imgPart.split('"')[1];

		return hiResImgLink.includes(searchTerm) || imgLink.includes(searchTerm);
	}

	generateContent(data = []) {
		const itemJsx = item => `${item.description}<p><b>tags: ${item.tags.replace(/ /g, ', ')}</b></p><hr />`;
		return Array.isArray(data) ? data.map((item, idx) => <div key={idx} dangerouslySetInnerHTML={{__html: itemJsx(item)}}></div>) : <div></div>;
	}

  	render() {
		const content = this.generateContent(this.state.data);
		return (
			<div className="App">
				<div className="search-input">
					<input type="text" onKeyUp={this.onTyping} />
				</div>
				<div className="content">
					{content}
				</div>
			</div>
		)
	}
}

export default App;
