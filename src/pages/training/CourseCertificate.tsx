import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLms } from '@/contexts/LmsContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const CourseCertificate: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { getCourseWithProgress } = useLms();
  const certRef = useRef<HTMLDivElement>(null);

  const course = getCourseWithProgress(courseId!);
  const isComplete = course && course.completedLessons === course.totalLessons && course.totalLessons > 0;

  if (!course) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Box textAlign="center">
          <Typography color="text.secondary" gutterBottom>Course not found</Typography>
          <Button onClick={() => navigate('/training')}>Back to catalog</Button>
        </Box>
      </Box>
    );
  }

  if (!isComplete) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Box textAlign="center">
          <EmojiEventsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Certificate Not Yet Available</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 2 }}>
            Complete all {course.totalLessons} lessons to earn your certificate. You've completed {course.completedLessons} so far.
          </Typography>
          <Button variant="outlined" onClick={() => navigate(`/training/${courseId}`)}>Continue Course</Button>
        </Box>
      </Box>
    );
  }

  const completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleDownload = () => {
    if (!certRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Certificate - ${course.title}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff}@media print{body{margin:0}}</style></head><body>${certRef.current.outerHTML}</body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 300);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3, py: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate(`/training/${courseId}`)}>Back to Course</Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownload} size="small">Download Certificate</Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <div
          ref={certRef}
          style={{
            width: 900, minHeight: 636, padding: '48px 64px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #f8fafc 100%)',
            border: '3px solid #1a3764', borderRadius: 12, position: 'relative', overflow: 'hidden',
            fontFamily: 'Georgia, "Times New Roman", serif', color: '#1e293b',
          }}
        >
          <div style={{ position: 'absolute', top: 12, left: 12, right: 12, bottom: 12, border: '1px solid #93c5fd', borderRadius: 8, pointerEvents: 'none' }} />
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1a3764" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            <p style={{ fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>Certificate of Completion</p>
            <div style={{ width: 80, height: 2, background: '#1a3764', margin: '16px auto 32px' }} />
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>This is to certify that</p>
            <p style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 8, fontStyle: 'italic' }}>Learner</p>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>has successfully completed the course</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#1a3764', marginBottom: 8 }}>{course.title}</p>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 32 }}>{course.totalLessons} lessons · {course.totalDurationMinutes} minutes · Instructor: {course.instructor}</p>
            <div style={{ width: 80, height: 1, background: '#cbd5e1', margin: '0 auto 24px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ width: 160, borderBottom: '1px solid #94a3b8', marginBottom: 4 }} />
                <p style={{ fontSize: 11, color: '#64748b' }}>{course.instructor}</p>
                <p style={{ fontSize: 10, color: '#94a3b8' }}>Instructor</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: '#64748b' }}>{completionDate}</p>
                <p style={{ fontSize: 10, color: '#94a3b8' }}>Date of Completion</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ width: 160, borderBottom: '1px solid #94a3b8', marginBottom: 4, marginLeft: 'auto' }} />
                <p style={{ fontSize: 11, color: '#64748b' }}>Training Department</p>
                <p style={{ fontSize: 10, color: '#94a3b8' }}>Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default CourseCertificate;
