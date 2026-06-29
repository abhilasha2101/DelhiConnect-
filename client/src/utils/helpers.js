import { format, formatDistanceToNow } from 'date-fns';
import { hi } from 'date-fns/locale/hi';
import i18next from 'i18next';

export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy, HH:mm');
};

export const timeAgo = (date) => {
  if (!date) return '—';
  const locale = i18next.language === 'hi' ? hi : undefined;
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale });
};

export const isSLABreached = (complaint) => {
  if (complaint.status === 'Resolved' || complaint.status === 'Rejected') return false;
  if (!complaint.slaDeadline) return false;
  return new Date() > new Date(complaint.slaDeadline);
};

export const getSLARemaining = (deadline) => {
  if (!deadline) return null;
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;
  if (diff <= 0) return 'Breached';
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${mins}m`;
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const translateDepartment = (dept) => {
  if (!dept) return '—';
  
  // Try direct translation first
  const directTranslation = i18next.t(dept);
  if (directTranslation !== dept) {
    return directTranslation;
  }
  
  // Match "Zone X Y Officer" (case-insensitive)
  const match = dept.match(/^Zone (\d+) (.+) Officer$/i);
  if (match) {
    const zoneNum = match[1];
    const deptName = match[2].trim();
    
    const deptTranslations = {
      'Sanitation': 'सफाई',
      'Public Works Department (PWD)': 'लोक निर्माण विभाग (PWD)',
      'Electricity': 'बिजली',
      'Water Supply': 'जल आपूर्ति',
      'Police / Safety': 'पुलिस / सुरक्षा',
      'Health Dept': 'स्वास्थ्य विभाग',
      'Parks & Gardens': 'पार्क और उद्यान',
      'General Administration': 'सामान्य प्रशासन'
    };
    
    if (i18next.language === 'hi') {
      const hiDept = deptTranslations[deptName] || deptName;
      return `ज़ोन ${zoneNum} ${hiDept} अधिकारी`;
    } else {
      return `Zone ${zoneNum} ${deptName} Officer`;
    }
  }
  
  return directTranslation;
};
