import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-20">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <h1 class="section-title">About Me</h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get to know more about my journey, values, and what drives me as a developer.
          </p>
        </div>

        <div class="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div class="animate-slide-in-left">
            <div class="relative">
              <div class="w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl mx-auto mb-8 flex items-center justify-center">
                <div class="w-72 h-72 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                  <span class="text-8xl font-bold text-gray-400">JD</span>
                </div>
              </div>
              <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center">
                <span class="text-2xl">🚀</span>
              </div>
            </div>
          </div>

          <div class="animate-slide-in-right">
            <h2 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Hi, I'm Bernard Zulu</h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              I'm a dedicated IT Support Specialist, Junior Network Technician, and Full-Stack Developer with expertise in providing technical support,
              network administration, and developing web applications. I specialize in troubleshooting complex IT issues, managing network infrastructure,
              and creating efficient software solutions.
            </p>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              With a strong foundation in both hardware and software systems, I excel at bridging the gap between technical requirements and practical solutions.
              I'm passionate about leveraging technology to solve real-world problems and continuously expanding my skills in modern development practices.
            </p>

            <div class="flex flex-wrap gap-4">
              <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>Lusaka, Zambia</span>
              </div>
              <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Available for opportunities</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Values Section -->
        <div class="mb-16">
          <h2 class="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">My Values</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-slide-up">
              <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Innovation</h3>
              <p class="text-gray-600 dark:text-gray-400">Always exploring new technologies and creative solutions to complex problems.</p>
            </div>

            <div class="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-slide-up" style="animation-delay: 0.1s;">
              <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Quality</h3>
              <p class="text-gray-600 dark:text-gray-400">Committed to writing clean, maintainable code and delivering exceptional user experiences.</p>
            </div>

            <div class="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-slide-up" style="animation-delay: 0.2s;">
              <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Collaboration</h3>
              <p class="text-gray-600 dark:text-gray-400">Believe in the power of teamwork and open communication to achieve great results.</p>
            </div>
          </div>
        </div>

        <!-- Experience Timeline -->
        <div>
          <h2 class="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Experience</h2>
          <div class="space-y-8">
            <div class="flex gap-6 animate-slide-in-left">
              <div class="flex flex-col items-center">
                <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold">2024</span>
                </div>
                <div class="w-0.5 h-16 bg-gray-300 dark:bg-gray-600 mt-4"></div>
              </div>
              <div class="flex-1 pb-8">
                <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">IT Support Specialist</h3>
                <p class="text-blue-600 dark:text-blue-400 mb-2">Technology Solutions Zambia</p>
                <p class="text-gray-600 dark:text-gray-400">Providing comprehensive IT support and network administration services. Managing network infrastructure, troubleshooting hardware/software issues, and implementing system optimizations for improved performance.</p>
              </div>
            </div>

            <div class="flex gap-6 animate-slide-in-left" style="animation-delay: 0.1s;">
              <div class="flex flex-col items-center">
                <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold">2023</span>
                </div>
                <div class="w-0.5 h-16 bg-gray-300 dark:bg-gray-600 mt-4"></div>
              </div>
              <div class="flex-1 pb-8">
                <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Junior Network Technician</h3>
                <p class="text-blue-600 dark:text-blue-400 mb-2">Zambia IT Services</p>
                <p class="text-gray-600 dark:text-gray-400">Maintaining and monitoring network systems, configuring routers and switches, and providing technical support to end-users. Implemented network security measures and conducted regular system maintenance.</p>
              </div>
            </div>

            <div class="flex gap-6 animate-slide-in-left" style="animation-delay: 0.2s;">
              <div class="flex flex-col items-center">
                <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold">2022</span>
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Full-Stack Developer</h3>
                <p class="text-blue-600 dark:text-blue-400 mb-2">Freelance / Personal Projects</p>
                <p class="text-gray-600 dark:text-gray-400">Developed web applications using Angular, Node.js, and modern frameworks. Built responsive user interfaces and implemented backend services. Created portfolio website and various client projects.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 3rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    @media (max-width: 768px) {
      .section-title {
        font-size: 2rem;
        margin-bottom: 2rem;
      }
    }
  `]
})
export class AboutComponent {

}
