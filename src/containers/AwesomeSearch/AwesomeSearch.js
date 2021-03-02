import React, { Component } from 'react';
import AwesomeListMenu from '../../components/AwesomeLists/AwesomeListMenu';
import AwesomeLists from '../../components/AwesomeLists/AwesomeLists';
import AwesomeInput from '../../components/AwesomeInput/AwesomeInput';
import AwesomeReadme from '../AwesomeReadme/AwesomeReadme';
import Spinner from '../../components/UI/Spinner/Spinner';
import axios from 'axios';
import Fuse from 'fuse.js';
import { Route, withRouter } from 'react-router-dom';
import classes from './AwesomeSearch.module.css';
import Backdrop from '../../components/UI/Backdrop/Backdrop';

class AwesomeSearch extends Component {
  state = {
    errorMessage: null,
    subjects: null,
    selectedSubject: 'Platforms',
    subjectsArray: [],
    search: '',
    searchResult: [],
    showResult: false,
    showToc: false,
  };

  getSubjectEntries = () => {
    axios
      .get(
        'https://raw.githubusercontent.com/lockys/awesome.json/master/awesome/awesome.json'
      )
      .then((subjects) => {
        this.setState({
          subjects: subjects.data,
          errorMessage: '',
        });

        let subjectsArray = Object.keys(subjects.data)
          .map((subject) => {
            return subjects.data[subject];
          })
          .reduce((arr, el) => {
            return arr.concat(el);
          }, []);

        this.setState({ subjectsArray: subjectsArray });

        if (!this.state.subjects) {
          this.setState({
            errorMessage:
              'There was an error. Unable to load the Awesome subjects.',
          });
        }
      })
      .catch((error) => {
        this.setState({
          errorMessage: `There was an error. Unable to load the Awesome subjects: ${error}.`,
        });
      });
  };

  componentDidMount() {
    this.getSubjectEntries();
  }

  topicOnClickHandler = (topic) => {
    this.setState({ selectedSubject: topic });
  };

  searchInputOnChangeHandler = (event) => {
    this.setState({
      search: event.target.value,
    });

    const options = {
      keys: ['name'],
    };

    const fuse = new Fuse(this.state.subjectsArray, options);
    const result = fuse.search(event.target.value);

    this.setState({ searchResult: result.slice(0, 20) });
  };

  searchInputOnFocusHandler = () => {
    this.props.history.push('/');
    this.setState({ showResult: true });
  };

  searchInputOnCloseHandler = () => {
    this.setState({ showResult: false });
  };

  showTocHandler = () => {
    this.setState((preState) => {
      return { showToc: !preState.showToc };
    });
  };

  render() {
    return (
      <div className={classes.AwesomeSearch}>
        <AwesomeInput
          searchOnchange={this.searchInputOnChangeHandler}
          value={this.state.search}
          searchResult={this.state.searchResult}
          searchInputOnFocus={this.searchInputOnFocusHandler}
          showResult={this.state.showResult}
        />
        <Route
          path="/:user/:repo"
          render={(props) => {
            return (
              <button
                className="btn btn-success btn-ghost"
                style={{
                  float: 'right',
                }}
                onClick={this.showTocHandler}
              >
                {this.state.showToc ? 'Close TOC' : 'Open TOC'}
              </button>
            );
          }}
        />
        {this.state.subjects ? (
          <div className="grid">
            <div className="cell -2of12">
              <AwesomeListMenu
                topics={Object.keys(this.state.subjects)}
                topicOnClickHandler={this.topicOnClickHandler}
              />
            </div>
            <div className="cell -10of12">
              <Route
                path="/"
                exact
                render={() => {
                  return (
                    <AwesomeLists
                      subjects={this.state.subjects[this.state.selectedSubject]}
                    />
                  );
                }}
              />
              <Route
                path="/:user/:repo"
                render={(props) => {
                  return (
                    <AwesomeReadme
                      key={props.match.params.repo}
                      showToc={this.state.showToc}
                      {...props}
                    />
                  );
                }}
              />
            </div>
            <Backdrop
              show={this.state.showResult}
              closeSeachModal={this.searchInputOnCloseHandler}
            />
          </div>
        ) : (
          <Spinner />
        )}
      </div>
    );
  }
}

export default withRouter(AwesomeSearch);