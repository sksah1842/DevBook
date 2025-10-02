import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getPosts } from '../../actions/post';
import PostItem from './PostItem';
import PostForm from './PostForm';

const Posts = ({ getPosts, post: { posts } }) => {
  const [query, setQuery] = useState('');
  useEffect(() => {
    getPosts();
  }, [getPosts]);

  const onSearch = (e) => {
    e.preventDefault();
    getPosts(query.trim() || undefined);
  };

  return (
    <section className='container'>
      <h1 className='large text-primary'>Posts</h1>

      <p className='lead'>
        <i className='fas fa-heart'></i> Welcome to the Developer Community
      </p>

      <PostForm />

      <form className='form' onSubmit={onSearch} style={{ marginBottom: '1rem' }}>
        <div className='form-group'>
          <input
            type='text'
            placeholder='Search posts by text or author name'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <input type='submit' className='btn btn-primary' value='Search' />
        <button
          type='button'
          className='btn'
          style={{ marginLeft: '0.5rem' }}
          onClick={() => {
            setQuery('');
            getPosts();
          }}
        >
          Reset
        </button>
      </form>

      <div className='posts'>
        {posts.map((post) => (
          <PostItem key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
};

Posts.propTypes = {
  getPosts: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({ post: state.post });

export default connect(mapStateToProps, { getPosts })(Posts);
