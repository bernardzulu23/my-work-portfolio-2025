import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AboutComponent } from './about.component';
import { AdminService, About } from '../../core/services/admin.service';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;
  let mockAdminService: jasmine.SpyObj<AdminService>;

  // Mock data matching the About interface
  const mockAboutData: About[] = [
    {
      id: '1',
      name: 'John Doe',
      title: 'Full Stack Developer',
      bio: 'A passionate developer with expertise in full-stack development.',
      tagline: 'Building amazing web applications',
      location: 'New York, USA',
      email: 'john.doe@example.com',
      availability: 'available',
      values: [
        {
          id: '1',
          title: 'Innovation',
          description: 'Always exploring new technologies',
          icon: 'lightning-bolt',
          color: 'blue'
        },
        {
          id: '2',
          title: 'Quality',
          description: 'Committed to excellence',
          icon: 'heart',
          color: 'purple'
        }
      ],
      experience: [
        {
          id: '1',
          year: '2024',
          title: 'Senior Developer',
          company: 'Tech Corp',
          description: 'Leading development projects',
          technologies: ['Angular', 'TypeScript', 'Node.js']
        },
        {
          id: '2',
          year: '2023',
          title: 'Full Stack Developer',
          company: 'Startup Inc',
          description: 'Building scalable applications',
          technologies: ['React', 'Python', 'AWS']
        }
      ]
    }
  ];

  beforeEach(async () => {
    // Create mock AdminService
    mockAdminService = jasmine.createSpyObj('AdminService', ['loadInitialData'], {
      getAbout: signal(mockAboutData)
    });

    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [
        { provide: AdminService, useValue: mockAdminService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject AdminService', () => {
    expect(component['adminService']).toBe(mockAdminService);
  });

  it('should call loadInitialData on ngOnInit', () => {
    component.ngOnInit();
    expect(mockAdminService.loadInitialData).toHaveBeenCalled();
  });

  describe('Data Binding', () => {
    it('should display data from AdminService in template', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      // Check if name is displayed
      const nameElement = compiled.querySelector('h2');
      expect(nameElement?.textContent?.trim()).toContain('John Doe');

      // Check if bio is displayed
      const bioElement = compiled.querySelector('p');
      expect(bioElement?.textContent?.trim()).toBe('A passionate developer with expertise in full-stack development.');
    });

    it('should render values section when data exists', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const valuesSection = compiled.querySelector('.grid.md\\:grid-cols-3');
      expect(valuesSection).toBeTruthy();
    });

    it('should render experience timeline when data exists', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const experienceSection = compiled.querySelector('.space-y-8');
      expect(experienceSection).toBeTruthy();
    });
  });

  describe('Helper Methods', () => {
    describe('getAvailabilityText', () => {
      it('should return correct text for available status', () => {
        expect(component.getAvailabilityText('available')).toBe('Available for opportunities');
      });

      it('should return correct text for busy status', () => {
        expect(component.getAvailabilityText('busy')).toBe('Currently busy');
      });

      it('should return correct text for unavailable status', () => {
        expect(component.getAvailabilityText('unavailable')).toBe('Not available');
      });

      it('should return default text for unknown status', () => {
        expect(component.getAvailabilityText('unknown')).toBe('Available for opportunities');
      });
    });

    describe('getAvailabilityColor', () => {
      it('should return correct color for available status', () => {
        expect(component.getAvailabilityColor('available')).toBe('text-green-600');
      });

      it('should return correct color for busy status', () => {
        expect(component.getAvailabilityColor('busy')).toBe('text-yellow-600');
      });

      it('should return correct color for unavailable status', () => {
        expect(component.getAvailabilityColor('unavailable')).toBe('text-red-600');
      });

      it('should return default color for unknown status', () => {
        expect(component.getAvailabilityColor('unknown')).toBe('text-green-600');
      });
    });

    describe('getValueIcon', () => {
      it('should return correct SVG path for lightning-bolt', () => {
        const expected = 'M13 10V3L4 14h7v7l9-11h-7z';
        expect(component.getValueIcon('lightning-bolt')).toBe(expected);
      });

      it('should return correct SVG path for heart', () => {
        const expected = 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z';
        expect(component.getValueIcon('heart')).toBe(expected);
      });

      it('should return correct SVG path for users', () => {
        const expected = 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z';
        expect(component.getValueIcon('users')).toBe(expected);
      });

      it('should return default icon for unknown icon type', () => {
        const expected = 'M13 10V3L4 14h7v7l9-11h-7z';
        expect(component.getValueIcon('unknown')).toBe(expected);
      });
    });

    describe('getValueColor', () => {
      it('should return correct classes for blue color', () => {
        expect(component.getValueColor('blue')).toBe('bg-blue-100 dark:bg-blue-900 text-blue-600');
      });

      it('should return correct classes for purple color', () => {
        expect(component.getValueColor('purple')).toBe('bg-purple-100 dark:bg-purple-900 text-purple-600');
      });

      it('should return correct classes for green color', () => {
        expect(component.getValueColor('green')).toBe('bg-green-100 dark:bg-green-900 text-green-600');
      });

      it('should return default color for unknown color', () => {
        expect(component.getValueColor('unknown')).toBe('bg-blue-100 dark:bg-blue-900 text-blue-600');
      });
    });

    describe('getExperienceColor', () => {
      it('should cycle through colors correctly', () => {
        expect(component.getExperienceColor(0)).toBe('bg-blue-600');
        expect(component.getExperienceColor(1)).toBe('bg-purple-600');
        expect(component.getExperienceColor(2)).toBe('bg-green-600');
        expect(component.getExperienceColor(3)).toBe('bg-blue-600'); // cycles back
      });
    });
  });

  describe('Template Integration', () => {
    it('should render component template without errors', () => {
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('should display dynamic name in template', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nameElement = compiled.querySelector('h2');
      expect(nameElement?.textContent?.trim()).toContain('John Doe');
    });

    it('should display dynamic bio in template', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const bioElement = compiled.querySelector('p');
      expect(bioElement?.textContent?.trim()).toBe('A passionate developer with expertise in full-stack development.');
    });

    it('should render values section when values exist', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const valuesSection = compiled.querySelector('.grid.md\\:grid-cols-3');
      expect(valuesSection).toBeTruthy();
    });

    it('should render experience timeline when experience exists', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const experienceSection = compiled.querySelector('.space-y-8');
      expect(experienceSection).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle component creation with empty data', async () => {
      // Create a new TestBed configuration for this specific test
      await TestBed.resetTestingModule();

      const adminServiceSpy = jasmine.createSpyObj('AdminService', ['loadInitialData'], {
        getAbout: signal([])
      });

      await TestBed.configureTestingModule({
        imports: [AboutComponent],
        providers: [
          { provide: AdminService, useValue: adminServiceSpy }
        ]
      }).compileComponents();

      const fixture = TestBed.createComponent(AboutComponent);
      const component = fixture.componentInstance;

      fixture.detectChanges();

      expect(component).toBeTruthy();
      // Test that component renders without errors when data is empty
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('About Me');
    });
  });
});
