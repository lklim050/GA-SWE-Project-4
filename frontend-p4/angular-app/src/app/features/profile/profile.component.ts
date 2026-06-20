import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, AuthUser } from '../../core/services/auth.service';
import { ApiService } from '../../services/api.service';

interface Tier {
  name: string;
  label: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  currentUser: AuthUser | null = null;
  surveysCompleted = 0;
  isLoading = true;

  tiers: Tier[] = [
    {
      name: 'Bronze',
      label: '🥉 Bronze',
      minPoints: 0,
      maxPoints: 100,
      color: '#92400e',
      bgColor: '#fef3c7',
    },
    {
      name: 'Silver',
      label: '🥈 Silver',
      minPoints: 100,
      maxPoints: 300,
      color: '#374151',
      bgColor: '#f3f4f6',
    },
    {
      name: 'Gold',
      label: '🥇 Gold',
      minPoints: 300,
      maxPoints: 700,
      color: '#92400e',
      bgColor: '#fef9c3',
    },
    {
      name: 'Platinum',
      label: '💎 Platinum',
      minPoints: 700,
      maxPoints: Infinity,
      // ↑ Infinity means no upper limit — once platinum, always platinum
      color: '#1e40af',
      bgColor: '#dbeafe',
    },
  ];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.apiService.getSurveys().subscribe({
      next: (res: any) => {
        this.surveysCompleted = res.surveys?.length || 0;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }
  get points(): number {
    return this.currentUser?.points_bal ?? 0;
  }
  get currentTier(): Tier {
    return (
      [...this.tiers].reverse().find((tier) => this.points >= tier.minPoints) ||
      this.tiers[0]
    );
  }

  // next tier user can go
  get nextTier(): Tier | null {
    const currentIndex = this.tiers.findIndex(
      (tier) => tier.name === this.currentTier.name,
    );
    return currentIndex < this.tiers.length - 1
      ? this.tiers[currentIndex + 1]
      : null;
  }

  get progressToNextTier(): number {
    if (!this.nextTier) return 100;

    const pointsIntoCurrentTier = this.points - this.currentTier.minPoints;
    const tierRange = this.nextTier.minPoints - this.currentTier.minPoints;
    return Math.round((pointsIntoCurrentTier / tierRange) * 100);
  }

  get pointsToNextTier(): number {
    if (!this.nextTier) return 0;
    return this.nextTier.minPoints - this.points;
  }
}
