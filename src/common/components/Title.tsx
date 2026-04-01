import React from 'react';
import Typography from '@mui/material/Typography';

interface TitleProps {
  titleHeader: string;
}

const Title: React.FC<TitleProps> = ({ titleHeader }) => {
  return (
    <Typography variant="h5" component="h1" fontWeight={700} color="text.primary">
      {titleHeader}
    </Typography>
  );
};

export default Title;
