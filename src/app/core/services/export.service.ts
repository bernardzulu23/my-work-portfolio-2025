import { Injectable } from '@angular/core';
import { WorkExperience, Education } from '../../features/experience/experience.component';

export type ExportFormat = 'pdf' | 'json' | 'txt';

export interface ExportOptions {
  includePersonalInfo?: boolean;
  includeContactInfo?: boolean;
  includeSkills?: boolean;
  includeEducation?: boolean;
  includeCertifications?: boolean;
  format: 'pdf' | 'json' | 'txt';
  theme: 'light' | 'dark';
}

export interface ResumeData {
  personalInfo?: {
    name: string;
    title: string;
    summary: string;
    location: string;
    email: string;
    phone: string;
    website: string;
    linkedin: string;
    github: string;
  };
  experiences: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private jsPDF: any;

  constructor() {
    this.loadJsPDF();
  }

  private async loadJsPDF(): Promise<void> {
    try {
      // Dynamic import of jsPDF to avoid bundling issues
      const jsPDFModule = await import('jspdf');
      this.jsPDF = jsPDFModule.default;
    } catch (error) {
      console.warn('jsPDF not available, PDF export will be disabled');
    }
  }

  async exportToPDF(data: ResumeData, options: Partial<ExportOptions> = {}): Promise<void> {
    if (!this.jsPDF) {
      throw new Error('jsPDF library not loaded. Please install jspdf package.');
    }

    const opts: ExportOptions = {
      includePersonalInfo: true,
      includeContactInfo: true,
      includeSkills: true,
      includeEducation: true,
      includeCertifications: true,
      format: 'pdf',
      theme: 'light',
      ...options
    };

    const pdf = new this.jsPDF();
    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * lineHeight);
    };

    // Helper function to check if we need a new page
    const checkNewPage = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.personalInfo?.name || 'Resume', margin, yPosition);
    yPosition += lineHeight * 2;

    if (opts.includePersonalInfo && data.personalInfo) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.personalInfo.title, margin, yPosition);
      yPosition += lineHeight * 1.5;

      if (data.personalInfo.summary) {
        yPosition = addWrappedText(data.personalInfo.summary, margin, yPosition, pageWidth - 2 * margin, 11);
        yPosition += lineHeight;
      }
    }

    // Contact Information
    if (opts.includeContactInfo && data.personalInfo) {
      checkNewPage(40);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const contactY = yPosition;
      let contactX = margin;

      if (data.personalInfo.email) {
        pdf.text(`Email: ${data.personalInfo.email}`, contactX, contactY);
        contactX += 60;
      }

      if (data.personalInfo.phone) {
        if (contactX > pageWidth - 60) {
          contactX = margin;
          yPosition += lineHeight;
        }
        pdf.text(`Phone: ${data.personalInfo.phone}`, contactX, contactY);
        contactX += 60;
      }

      if (data.personalInfo.location) {
        if (contactX > pageWidth - 60) {
          contactX = margin;
          yPosition += lineHeight;
        }
        pdf.text(`Location: ${data.personalInfo.location}`, contactX, contactY);
      }

      yPosition += lineHeight * 2;
    }

    // Experience Section
    if (data.experiences && data.experiences.length > 0) {
      checkNewPage(30);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Professional Experience', margin, yPosition);
      yPosition += lineHeight * 1.5;

      for (const experience of data.experiences) {
        checkNewPage(50);

        // Company and Position
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(experience.position, margin, yPosition);
        yPosition += lineHeight;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`${experience.company} | ${experience.location}`, margin, yPosition);
        yPosition += lineHeight * 0.5;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${experience.startDate} - ${experience.endDate || 'Present'}`, margin, yPosition);
        yPosition += lineHeight * 1.5;

        // Description
        if (experience.description) {
          yPosition = addWrappedText(experience.description, margin, yPosition, pageWidth - 2 * margin, 11);
          yPosition += lineHeight * 0.5;
        }

        // Achievements
        if (experience.achievements && experience.achievements.length > 0) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Key Achievements:', margin, yPosition);
          yPosition += lineHeight;

          pdf.setFont('helvetica', 'normal');
          for (const achievement of experience.achievements) {
            yPosition = addWrappedText(`• ${achievement}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 10);
          }
          yPosition += lineHeight;
        }

        // Technologies
        if (experience.technologies && experience.technologies.length > 0) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Technologies:', margin, yPosition);
          yPosition += lineHeight;

          pdf.setFont('helvetica', 'normal');
          const techText = experience.technologies.join(', ');
          yPosition = addWrappedText(techText, margin + 5, yPosition, pageWidth - 2 * margin - 5, 10);
          yPosition += lineHeight;
        }

        yPosition += lineHeight;
      }
    }

    // Education Section
    if (opts.includeEducation && data.education && data.education.length > 0) {
      checkNewPage(30);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Education', margin, yPosition);
      yPosition += lineHeight * 1.5;

      for (const edu of data.education) {
        checkNewPage(25);

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(edu.degree, margin, yPosition);
        yPosition += lineHeight;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`${edu.institution} | ${edu.location}`, margin, yPosition);
        yPosition += lineHeight * 0.5;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${edu.endDate || 'Present'}`, margin, yPosition);
        yPosition += lineHeight * 1.5;

        if (edu.description) {
          yPosition = addWrappedText(edu.description, margin, yPosition, pageWidth - 2 * margin, 11);
          yPosition += lineHeight;
        }

        if (edu.gpa) {
          pdf.setFontSize(10);
          pdf.text(`GPA: ${edu.gpa}`, margin, yPosition);
          yPosition += lineHeight;
        }

        yPosition += lineHeight;
      }
    }

    // Skills Section
    if (opts.includeSkills && data.skills && data.skills.length > 0) {
      checkNewPage(30);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Skills', margin, yPosition);
      yPosition += lineHeight * 1.5;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const skillsText = data.skills.join(', ');
      yPosition = addWrappedText(skillsText, margin, yPosition, pageWidth - 2 * margin, 11);
      yPosition += lineHeight * 2;
    }

    // Certifications Section
    if (opts.includeCertifications && data.certifications && data.certifications.length > 0) {
      checkNewPage(30);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Certifications', margin, yPosition);
      yPosition += lineHeight * 1.5;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      for (const cert of data.certifications) {
        yPosition = addWrappedText(`• ${cert}`, margin, yPosition, pageWidth - 2 * margin, 11);
        yPosition += lineHeight * 0.5;
      }
    }

    // Footer
    const footerY = pageHeight - 15;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Generated by Portfolio App', margin, footerY);

    // Save the PDF
    const fileName = `resume_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }

  exportToJSON(data: ResumeData): void {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `resume_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  }

  exportToTXT(data: ResumeData): void {
    let textContent = '';

    if (data.personalInfo) {
      textContent += `${data.personalInfo.name}\n`;
      textContent += `${data.personalInfo.title}\n\n`;

      if (data.personalInfo.summary) {
        textContent += `SUMMARY\n${data.personalInfo.summary}\n\n`;
      }

      if (data.personalInfo.email || data.personalInfo.phone || data.personalInfo.location) {
        textContent += 'CONTACT\n';
        if (data.personalInfo.email) textContent += `Email: ${data.personalInfo.email}\n`;
        if (data.personalInfo.phone) textContent += `Phone: ${data.personalInfo.phone}\n`;
        if (data.personalInfo.location) textContent += `Location: ${data.personalInfo.location}\n`;
        textContent += '\n';
      }
    }

    if (data.experiences && data.experiences.length > 0) {
      textContent += 'PROFESSIONAL EXPERIENCE\n\n';
      for (const experience of data.experiences) {
        textContent += `${experience.position}\n`;
        textContent += `${experience.company}, ${experience.location}\n`;
        textContent += `${experience.startDate} - ${experience.endDate || 'Present'}\n\n`;

        if (experience.description) {
          textContent += `${experience.description}\n\n`;
        }

        if (experience.achievements && experience.achievements.length > 0) {
          textContent += 'Key Achievements:\n';
          for (const achievement of experience.achievements) {
            textContent += `• ${achievement}\n`;
          }
          textContent += '\n';
        }

        if (experience.technologies && experience.technologies.length > 0) {
          textContent += `Technologies: ${experience.technologies.join(', ')}\n\n`;
        }

        textContent += '---\n\n';
      }
    }

    if (data.education && data.education.length > 0) {
      textContent += 'EDUCATION\n\n';
      for (const edu of data.education) {
        textContent += `${edu.degree}\n`;
        textContent += `${edu.institution}, ${edu.location}\n`;
        textContent += `Graduated: ${edu.endDate || 'Present'}\n`;

        if (edu.description) {
          textContent += `${edu.description}\n`;
        }

        if (edu.gpa) {
          textContent += `GPA: ${edu.gpa}\n`;
        }

        textContent += '\n';
      }
    }

    if (data.skills && data.skills.length > 0) {
      textContent += `SKILLS\n${data.skills.join(', ')}\n\n`;
    }

    if (data.certifications && data.certifications.length > 0) {
      textContent += 'CERTIFICATIONS\n';
      for (const cert of data.certifications) {
        textContent += `• ${cert}\n`;
      }
    }

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `resume_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  }

  async exportResume(data: ResumeData, format: 'pdf' | 'json' | 'txt' = 'pdf', options?: Partial<ExportOptions>): Promise<void> {
    try {
      switch (format) {
        case 'pdf':
          await this.exportToPDF(data, options);
          break;
        case 'json':
          this.exportToJSON(data);
          break;
        case 'txt':
          this.exportToTXT(data);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  // Utility method to prepare resume data from experience component
  prepareResumeData(
    personalInfo: any,
    experiences: WorkExperience[],
    education: Education[],
    skills: string[],
    certifications: string[]
  ): ResumeData {
    return {
      personalInfo,
      experiences,
      education,
      skills,
      certifications
    };
  }
}
