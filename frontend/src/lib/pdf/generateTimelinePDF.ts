// lib/pdf/generateTimelinePDF.ts
/**
 * Generate PDF from timeline data using jsPDF
 */

import jsPDF from 'jspdf';
import type { TimelineOutput, TimelinePhase } from '@/lib/offers/definitions/timeline/timeline-types';

const COLORS = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  text: '#1e293b',
  lightText: '#64748b',
  border: '#e2e8f0',
  background: '#f8fafc',
};

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
};

export async function generateTimelinePDF(data: TimelineOutput, endingCTA?: { headshot?: string; displayName?: string; title?: string; email?: string; phone?: string }): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Helper to add new page if needed
  const checkPageBreak = (neededHeight: number) => {
    if (yPosition + neededHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper to wrap text
  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    fontSize: number,
    color: string = COLORS.text
  ): number => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, index: number) => {
      checkPageBreak(lineHeight);
      doc.text(line, x, y + index * lineHeight);
    });
    return lines.length * lineHeight;
  };

  // Helper to load and add image (only works in browser environment)
  const addImageIfAvailable = async (imageUrl: string | undefined, x: number, y: number, width: number, height: number): Promise<boolean> => {
    if (!imageUrl || typeof window === 'undefined' || typeof document === 'undefined') {
      return false;
    }
    
    try {
      // Convert image URL to data URL (this works for same-origin images)
      // For cross-origin images, you'd need a proxy or CORS-enabled server
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(false);
        }, 5000); // 5 second timeout
        
        img.onload = () => {
          clearTimeout(timeout);
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL('image/png');
              doc.addImage(dataUrl, 'PNG', x, y, width, height);
              resolve(true);
            } else {
              resolve(false);
            }
          } catch (err) {
            console.warn('Failed to add image to PDF:', err);
            resolve(false);
          }
        };
        img.onerror = () => {
          clearTimeout(timeout);
          resolve(false);
        };
        img.src = imageUrl;
      });
    } catch (err) {
      console.warn('Failed to load image for PDF:', err);
      return false;
    }
  };

  // ==================== HEADER WITH HEADSHOT ====================
  // Agent headshot (if available) - positioned on the right side
  const headshotUrl = endingCTA?.headshot || data.agentInfo?.photo;
  const headshotSize = 20; // 20mm diameter
  const headshotX = pageWidth - margin - headshotSize;
  const headshotY = yPosition;
  
  if (headshotUrl && typeof window !== 'undefined') {
    // Only try to add image in browser environment
    const imageAdded = await addImageIfAvailable(headshotUrl, headshotX, headshotY, headshotSize, headshotSize);
    if (imageAdded) {
      // Draw circle border around headshot
      doc.setDrawColor(COLORS.primary);
      doc.setLineWidth(0.5);
      doc.circle(headshotX + headshotSize / 2, headshotY + headshotSize / 2, headshotSize / 2, 'D');
    }
  }

  // Title (left side, with space for headshot)
  const titleWidth = headshotUrl ? contentWidth - headshotSize - 5 : contentWidth;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(COLORS.primary);
  const titleLines = doc.splitTextToSize(data.title, titleWidth);
  titleLines.forEach((line: string, index: number) => {
    doc.text(line, margin, yPosition + index * 10);
  });
  yPosition += Math.max(titleLines.length * 10, headshotSize) + 5;
  
  // Agent name and title below headshot (if headshot was added)
  if (headshotUrl && (endingCTA?.displayName || data.agentInfo?.name)) {
    const agentName = endingCTA?.displayName || data.agentInfo?.name || '';
    const agentTitle = endingCTA?.title || '';
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(COLORS.text);
    doc.text(agentName, headshotX, yPosition, { align: 'right', maxWidth: headshotSize + 5 });
    
    if (agentTitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(COLORS.lightText);
      doc.text(agentTitle, headshotX, yPosition + 5, { align: 'right', maxWidth: headshotSize + 5 });
    }
  }

  // Subtitle
  if (data.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(COLORS.lightText);
    const subtitleLines = doc.splitTextToSize(data.subtitle, contentWidth);
    subtitleLines.forEach((line: string, index: number) => {
      doc.text(line, margin, yPosition + index * 6);
    });
    yPosition += subtitleLines.length * 6 + 5;
  }

  // Divider line
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // ==================== USER SITUATION ====================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(COLORS.text);
  doc.text('Your Situation', margin, yPosition);
  yPosition += 8;

  const situation = data.userSituation;
  const situationItems = [
    situation.flow && { label: 'Goal', value: situation.flow === 'buy' ? 'Buying' : situation.flow === 'sell' ? 'Selling' : 'Exploring' },
    situation.location && { label: 'Location', value: situation.location },
    situation.budget && { label: 'Budget', value: situation.budget },
    situation.timeline && { label: 'Timeline', value: situation.timeline },
  ].filter(Boolean) as { label: string; value: string }[];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  situationItems.forEach((item, index) => {
    const xPos = margin + (index % 2) * (contentWidth / 2);
    if (index > 0 && index % 2 === 0) {
      yPosition += 6;
      checkPageBreak(10);
    }
    doc.setTextColor(COLORS.lightText);
    doc.text(`${item.label}:`, xPos, yPosition);
    doc.setTextColor(COLORS.text);
    doc.text(item.value, xPos + 25, yPosition);
  });
  yPosition += 10;

  // ==================== PHASES ====================
  data.phases.forEach((phase, phaseIndex) => {
    checkPageBreak(60);

    // Phase header background
    doc.setFillColor(COLORS.background);
    doc.roundedRect(margin, yPosition, contentWidth, 12, 2, 2, 'F');

    // Phase number circle
    doc.setFillColor(COLORS.primary);
    doc.circle(margin + 6, yPosition + 6, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#ffffff');
    doc.text(String(phaseIndex + 1), margin + 4.5, yPosition + 7.5);

    // Phase name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(COLORS.text);
    doc.text(phase.name, margin + 14, yPosition + 7);

    // Timeline badge
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.primary);
    const timelineWidth = doc.getTextWidth(phase.timeline);
    doc.text(phase.timeline, pageWidth - margin - timelineWidth, yPosition + 7);

    yPosition += 16;

    // Description
    if (phase.description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const descHeight = addWrappedText(
        phase.description,
        margin + 4,
        yPosition,
        contentWidth - 8,
        5,
        10,
        COLORS.lightText
      );
      yPosition += descHeight + 4;
    }

    // Action Items
    if (phase.actionItems && phase.actionItems.length > 0) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(COLORS.text);
      doc.text('Action Items:', margin + 4, yPosition);
      yPosition += 5;

      phase.actionItems.forEach((item) => {
        checkPageBreak(8);

        // Priority indicator
        const priorityColor = PRIORITY_COLORS[item.priority] || COLORS.lightText;
        doc.setFillColor(priorityColor);
        doc.circle(margin + 7, yPosition - 1, 1.5, 'F');

        // Task text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(COLORS.text);
        const taskLines = doc.splitTextToSize(item.task, contentWidth - 16);
        taskLines.forEach((line: string, lineIndex: number) => {
          doc.text(line, margin + 12, yPosition + lineIndex * 4);
        });
        yPosition += taskLines.length * 4 + 2;
      });
      yPosition += 2;
    }

    // Agent Advice
    if (phase.agentAdvice && phase.agentAdvice.length > 0) {
      checkPageBreak(20);

      // Light background for advice section
      const adviceStartY = yPosition;
      doc.setFillColor('#fef3c7'); // Light amber
      doc.roundedRect(margin + 4, yPosition - 2, contentWidth - 8, 8, 1, 1, 'F');

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor('#92400e');
      doc.text('Expert Tip:', margin + 8, yPosition + 3);
      yPosition += 6;

      phase.agentAdvice.slice(0, 2).forEach((advice) => {
        checkPageBreak(8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(COLORS.lightText);
        const adviceLines = doc.splitTextToSize(`"${advice}"`, contentWidth - 16);
        adviceLines.forEach((line: string, lineIndex: number) => {
          doc.text(line, margin + 8, yPosition + lineIndex * 4);
        });
        yPosition += adviceLines.length * 4 + 2;
      });
      yPosition += 2;
    }

    yPosition += 8;
  });

  // ==================== DISCLAIMER ====================
  if (data.disclaimer) {
    checkPageBreak(30);

    // Disclaimer box
    doc.setFillColor('#fef9c3');
    doc.setDrawColor('#facc15');
    doc.roundedRect(margin, yPosition, contentWidth, 20, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor('#854d0e');
    doc.text('Important Note', margin + 4, yPosition + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const disclaimerLines = doc.splitTextToSize(data.disclaimer, contentWidth - 8);
    disclaimerLines.slice(0, 3).forEach((line: string, index: number) => {
      doc.text(line, margin + 4, yPosition + 10 + index * 3.5);
    });
    yPosition += 24;
  }

  // ==================== AGENT INFO FOOTER ====================
  if (headshotUrl || endingCTA?.displayName || data.agentInfo?.name) {
    checkPageBreak(30);
    
    // Footer section with agent info
    doc.setFillColor(COLORS.background);
    doc.roundedRect(margin, yPosition, contentWidth, 25, 2, 2, 'F');
    
    const footerHeadshotSize = 18; // 18mm diameter
    const footerHeadshotX = margin + 5;
    const footerHeadshotY = yPosition + 3.5;
    
    if (headshotUrl && typeof window !== 'undefined') {
      await addImageIfAvailable(headshotUrl, footerHeadshotX, footerHeadshotY, footerHeadshotSize, footerHeadshotSize);
      // Draw circle border
      doc.setDrawColor(COLORS.primary);
      doc.setLineWidth(0.5);
      doc.circle(footerHeadshotX + footerHeadshotSize / 2, footerHeadshotY + footerHeadshotSize / 2, footerHeadshotSize / 2, 'D');
    }
    
    // Agent info text
    const textStartX = margin + 5 + footerHeadshotSize + 5;
    const textWidth = contentWidth - footerHeadshotSize - 15;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(COLORS.text);
    const agentName = endingCTA?.displayName || data.agentInfo?.name || 'Your Agent';
    doc.text(agentName, textStartX, yPosition + 8);
    
    if (endingCTA?.title || data.agentInfo?.company) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(COLORS.lightText);
      const title = endingCTA?.title || data.agentInfo?.company || '';
      doc.text(title, textStartX, yPosition + 12);
    }
    
    // Contact info
    if (endingCTA?.email || data.agentInfo?.email) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(COLORS.primary);
      const email = endingCTA?.email || data.agentInfo?.email || '';
      doc.text(email, textStartX, yPosition + 17);
    }
    
    if (endingCTA?.phone || data.agentInfo?.phone) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(COLORS.primary);
      const phone = endingCTA?.phone || data.agentInfo?.phone || '';
      doc.text(phone, textStartX, yPosition + 21);
    }
    
    yPosition += 30;
  }

  // ==================== FOOTER ====================
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.lightText);

    // Page number
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Generated date
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      margin,
      pageHeight - 10
    );

    // Total time
    if (data.totalEstimatedTime) {
      doc.text(
        `Total Time: ${data.totalEstimatedTime}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      );
    }
  }

  // Save the PDF
  const fileName = `${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.pdf`;
  doc.save(fileName);
}

/**
 * Alternative: Generate PDF by capturing HTML element
 * Use this if you want the PDF to match the web styling exactly
 */
export async function generatePDFFromElement(elementId: string, filename: string): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 10;

  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight + 10;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${filename}.pdf`);
}
