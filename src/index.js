import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import $ from 'jquery';
import config from './config'
let tmdbKey = config.tmdbKey;

class MovieCard extends Component{
    constructor(props){
    	super(props);
    	this.state = {
    		flipped: false
    	};

      this.flipDetails= this.flipDetails.bind(this);
    }

  flipDetails(){
    this.setState({flipped: !this.state.flipped}); 
  }
  
  render(){
    return (
      <div className="movieContainer">
        <div className={"movieCard" + (this.state.flipped?" flipped":"")} onClick={this.flipDetails}>
          <MoviePoster title={this.props.title} genre={this.props.genre} poster={this.props.poster}/>
          <MovieDetails title={this.props.title} genre={this.props.genre} info={this.props.info} id={this.props.id}/>
        </div>
      </div>
    );
  } 
}

class MovieDetails extends Component{
  render(){
    return (
       <div className="movieDetails" >
        <h2 className="title">{this.props.title}</h2>
        <h4 className="genre">{this.props.genre}</h4>
        <p className="info">{this.props.info}</p>
        <button className='moreInfo' onClick={(event)=>{window.open(`https://themoviedb.org/movie/${this.props.id}`,'_blank');event.stopPropagation();} } >More</button>
      </div>
    );
  }
}

class MoviePoster extends Component{
  render(){
    return (
      <div title= {this.props.title} className="moviePoster" style={{backgroundImage: "url(" + this.props.poster + ")"}}></div>
    );
  }
}

class SearchResults extends Component{

  constructor(props){
  	super(props);
  	this.state = {
  		page: 1,
  		totalPages: 1,
  		searchResults: [],
  		searchVal: ""
      
  	};
    this.prevPage= this.prevPage.bind(this);
    this.nextPage= this.nextPage.bind(this);
    this.updateSearch= this.updateSearch.bind(this);
  }

  renderMovie(movie,index){
    if( (movie.info!=="") && (movie.title!=="") ){
      return (<MovieCard key={index}title={movie.title} genre={movie.genre} info={movie.info} poster={movie.poster} id={movie.id}/>); 
    }
  }
  
  updateSearch(val){
    if(val===""){
      // this.setState({searchVal:"",searchResults:[],page:1,totalPages:1})
      this.setState({searchVal:"",page:1,totalPages:1},()=> {setTimeout( ()=> {this.setState({
      searchResults:[]});},500)});      
    }
    else{
      this.setState({searchVal:val,page:1,totalPages:1},()=> {setTimeout( ()=> {this.setState({
      searchResults:this.getMovies(this.state.searchVal)});},500)});
    }
  }
  
  nextPage(){
    let page = this.state.page;
    if(page<this.state.totalPages){
      page+=1;
    
    this.setState({page:page},()=>{setTimeout( ()=> {this.setState({
      searchResults:this.getMovies(this.state.searchVal)});},25);});
      console.log(this.state.page);
    }
    
  }
  
  prevPage(){
    let page = this.state.page;
    if(page>1){
      page-=1;
      this.setState({page:page},()=>{setTimeout( ()=> {this.setState({
      searchResults:this.getMovies(this.state.searchVal)});},25);});
      console.log(this.state.page)
    }
  }
  
  findMovie(movieId){
    let id = movieId;
    let api=`https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbKey}`;
    let movie = {};
    
    $.ajax({
      url: api, 
      async: false,
      dataType: 'json',
      success: function(data){
        movie.id = data.id;
        movie.title = data.title;  
        movie.genre = data.genres.length>0 ? data.genres[0].name:"";
        movie.info = data.overview;
        movie.poster = data.poster_path === null ? "http://i.imgur.com/R7mqXKL.png":("https://image.tmdb.org/t/p/w500"+data.poster_path);
      },
      error: function(data){
        console.log("error finding movie");
      }
    });
    return movie;
  }
  
  getMovies(title){
    let api = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&language=en-US&query=${title}&page=${this.state.page}&include_adult=false`;
    let movies = [];
    
    if(title!==''){
    $.ajax({
      url: api,
      async: false,
      dataType: 'json',
      success: (data)=> {
        movies = data.results;
        this.setState({totalPages:data.total_pages});
      },
      error: (data)=>{
        console.log("Error finding movies");
      }
    });
    
    return movies.map( 
      (data)=>{ return data.id;}).map((id)=>{
      return this.findMovie(id);
    });
    }
    else{
      console.log("no title entered");
      return movies;
    }
    // return movies.map((data)=>{
    //   return this.findMovie(data);
    // });
  }// Returns a list of movies per page
 
  render(){
    return (
      <div>
        <h1 className="header">Movie Cards</h1>
        <SearchBar updateSearch={this.updateSearch}/>
        <div className={"searchView" + (this.state.searchVal.length>0?" showView":"")}>
          {this.state.searchResults.map(this.renderMovie)}
        </div>
        <div className="pageControls">
          <PageChange direction="Prev" changePage={this.prevPage} showBtn={this.state.page>1}/>
          <PageChange direction="Next" changePage={this.nextPage} showBtn={this.state.page<this.state.totalPages}/>
        </div>
      </div>
    );
  }
}

class SearchBar extends Component{
	render(){ 
		return ( 
			<div>
				<div className="searchBar">
          			<input type="text" name="search" placeholder="Search.." onChange={(event)=> this.props.updateSearch(event.target.value)}/>
        		</div>
      		</div>
    	);
  	}
}

class PageChange extends Component{
  render(){
    return (
        <button className={this.props.direction + (this.props.showBtn?" showBtn":"")} onClick={this.props.changePage}>{this.props.direction}</button>
    );
  }
}

ReactDOM.render(<SearchResults />,document.getElementById('root'));

