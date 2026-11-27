import { Link } from 'react-router-dom'
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'

const BlogList = ({ blogs }) => {
  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

  return (
    <div>
      <Typography variant="h4" component="h2" sx={{ my: 2 }}>
        Blogs
      </Typography>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell align="right">Likes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedBlogs.map(blog => (
              <TableRow key={blog.id} hover className="blog">
                <TableCell className="blog-summary">
                  <Link to={`/blogs/${blog.id}`}>
                    {blog.title}
                  </Link>
                </TableCell>
                <TableCell>{blog.author}</TableCell>
                <TableCell align="right">{blog.likes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default BlogList
