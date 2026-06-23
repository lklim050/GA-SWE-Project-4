import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LogoComponent } from '../../shared/components/logo/logo.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, LogoComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
  goToApp() {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/register']);
    }
  }

  tiers = [
    {
      name: 'Bronze',
      icon: '🥉',
      points: '0 – 100 pts',
      color: 'from-amber-600 to-amber-400',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      perks: [
        'Access all surveys',
        'Earn points per survey',
        'View your responses',
      ],
    },
    {
      name: 'Silver',
      icon: '🥈',
      points: '100 – 300 pts',
      color: 'from-slate-500 to-slate-300',
      textColor: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      perks: [
        'All Bronze Perks',
        'Silver Member Badge',
        'Weekly Digest (coming soon...)',
      ],
    },
    {
      name: 'Gold',
      icon: '🥇',
      points: '300 – 700 pts',
      color: 'from-yellow-500 to-yellow-300',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      perks: [
        'All Silver Perks',
        'Gold Member Badge',
        'Bonus Point Surveys (coming soon...)',
      ],
    },
    {
      name: 'Platinum',
      icon: '💎',
      points: '700+ pts',
      color: 'from-cyan-500 to-teal-400',
      textColor: 'text-cyan-700',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      perks: [
        'All Gold Perks',
        'Exclusive Platinum Badge',
        'Top of Leaderboard (coming soon...)',
      ],
    },
  ];
  steps = [
    {
      number: '01',
      icon: '📝',
      title: 'Register & Join',
      desc: 'Create your free account in seconds. Choose to join as a Survey Taker or Survey Host.',
    },
    {
      number: '02',
      icon: '✅',
      title: 'Complete Surveys',
      desc: 'Browse published community surveys and share your opinions on topics that matter.',
    },
    {
      number: '03',
      icon: '⭐',
      title: 'Earn Points',
      desc: 'Every completed survey credits points to your account. Watch your tier climb.',
    },
  ];

  // Features
  features = [
    {
      icon: '🎯',
      title: 'Gamified Rewards',
      desc: 'Earn points for every survey completed. Climb through Bronze, Silver, Gold and Platinum tiers.',
    },
    {
      icon: '📊',
      title: 'Host Analytics',
      desc: 'Survey hosts get real-time visual results with bar charts and response breakdowns.',
    },
    {
      icon: '🤖',
      title: 'AI-Powered Insights',
      desc: 'Our AI analyses your survey responses and generates structured trend reports automatically.',
    },
    {
      icon: '🔒',
      title: 'Data Protection',
      desc: 'Every text questions and responses are authenticated and protected to ensure data quality and authentic feedback.',
    },
    {
      icon: '👥',
      title: 'Role-Based Access',
      desc: 'Separate experiences for Survey Takers and Hosts — everyone gets the right tools.',
    },
    {
      icon: '🦁',
      title: 'Built for Singapore',
      desc: 'Designed with Singapore community topics in mind — transport, food, lifestyle and more.',
    },
  ];
}
