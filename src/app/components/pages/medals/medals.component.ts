import { Component, OnInit } from '@angular/core';

// Enums
enum MedalTier {
  LOCKED = 'locked',
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold'
}

enum MedalCategory {
  PROJECTS = 'projects',
  SKILLS = 'skills',
  COLLABORATION = 'collaboration',
  LEARNING = 'learning',
  ACHIEVEMENT = 'achievement',
  SPECIAL = 'special'
}

// Interfaces
interface Rank {
  level: number;
  name: string;
  nameKey: string;
  minXP: number;
  icon: string;
  color: string;
}

interface Medal {
  id: string;
  nameKey: string;
  descriptionKey: string;
  category: MedalCategory;
  tier: MedalTier;
  progress: number;
  maxProgress: number;
  icon: string;
  unlockedAt?: Date;
  requirements: {
    bronze: number;
    silver: number;
    gold: number;
  };
}

interface UserProgress {
  currentXP: number;
  totalProjects: number;
  totalSkills: number;
  totalCollaborations: number;
  articlesPublished: number;
  certificationsEarned: number;
}

@Component({
  selector: 'app-medals',
  templateUrl: './medals.component.html',
  styleUrls: ['./medals.component.css']
})
export class MedalsComponent implements OnInit {
  
  // Dados do usuário (virão do backend futuramente)
  userProgress: UserProgress = {
    currentXP: 15750,
    totalProjects: 42,
    totalSkills: 28,
    totalCollaborations: 15,
    articlesPublished: 8,
    certificationsEarned: 5
  };

  currentRank!: Rank;
  nextRank?: Rank;
  progressToNextRank: number = 0;

  selectedCategory: MedalCategory | 'all' = 'all';
  MedalCategory = MedalCategory;

  // Sistema de 30+ níveis de progressão (Recruta → General)
  ranks: Rank[] = [
    { level: 1, name: 'Recruta', nameKey: 'MEDALS.RANKS.RECRUIT', minXP: 0, icon: '🎖️', color: '#8B4513' },
    { level: 2, name: 'Soldado Raso', nameKey: 'MEDALS.RANKS.PRIVATE', minXP: 100, icon: '🎖️', color: '#8B4513' },
    { level: 3, name: 'Soldado', nameKey: 'MEDALS.RANKS.SOLDIER', minXP: 300, icon: '🎖️', color: '#8B6914' },
    { level: 4, name: 'Cabo', nameKey: 'MEDALS.RANKS.CORPORAL', minXP: 600, icon: '🎖️', color: '#A0826D' },
    { level: 5, name: 'Cabo Superior', nameKey: 'MEDALS.RANKS.SENIOR_CORPORAL', minXP: 1000, icon: '🎖️', color: '#B8956A' },
    { level: 6, name: 'Sargento', nameKey: 'MEDALS.RANKS.SERGEANT', minXP: 1500, icon: '⭐', color: '#CD7F32' },
    { level: 7, name: 'Sargento 2º Classe', nameKey: 'MEDALS.RANKS.SERGEANT_2ND', minXP: 2100, icon: '⭐', color: '#CD7F32' },
    { level: 8, name: 'Sargento 1º Classe', nameKey: 'MEDALS.RANKS.SERGEANT_1ST', minXP: 2800, icon: '⭐', color: '#D4AF37' },
    { level: 9, name: 'Subtenente', nameKey: 'MEDALS.RANKS.WARRANT_OFFICER', minXP: 3600, icon: '⭐', color: '#E5C100' },
    { level: 10, name: 'Aspirante', nameKey: 'MEDALS.RANKS.ASPIRANT', minXP: 4500, icon: '⭐', color: '#FFD700' },
    { level: 11, name: '2º Tenente', nameKey: 'MEDALS.RANKS.SECOND_LIEUTENANT', minXP: 5500, icon: '🌟', color: '#C0C0C0' },
    { level: 12, name: '1º Tenente', nameKey: 'MEDALS.RANKS.FIRST_LIEUTENANT', minXP: 6600, icon: '🌟', color: '#C0C0C0' },
    { level: 13, name: 'Capitão', nameKey: 'MEDALS.RANKS.CAPTAIN', minXP: 7800, icon: '🌟', color: '#D3D3D3' },
    { level: 14, name: 'Major', nameKey: 'MEDALS.RANKS.MAJOR', minXP: 9100, icon: '🌟', color: '#E8E8E8' },
    { level: 15, name: 'Tenente-Coronel', nameKey: 'MEDALS.RANKS.LIEUTENANT_COLONEL', minXP: 10500, icon: '🌟', color: '#F0F0F0' },
    { level: 16, name: 'Coronel', nameKey: 'MEDALS.RANKS.COLONEL', minXP: 12000, icon: '💫', color: '#FFD700' },
    { level: 17, name: 'General de Brigada', nameKey: 'MEDALS.RANKS.BRIGADIER_GENERAL', minXP: 13600, icon: '💫', color: '#FFD700' },
    { level: 18, name: 'General de Divisão', nameKey: 'MEDALS.RANKS.MAJOR_GENERAL', minXP: 15300, icon: '💫', color: '#FFA500' },
    { level: 19, name: 'General de Exército', nameKey: 'MEDALS.RANKS.LIEUTENANT_GENERAL', minXP: 17100, icon: '💫', color: '#FF8C00' },
    { level: 20, name: 'General', nameKey: 'MEDALS.RANKS.GENERAL', minXP: 19000, icon: '👑', color: '#FF6347' },
    { level: 21, name: 'Marechal de Campo', nameKey: 'MEDALS.RANKS.FIELD_MARSHAL', minXP: 21000, icon: '👑', color: '#DC143C' },
    { level: 22, name: 'Grande Marechal', nameKey: 'MEDALS.RANKS.GRAND_MARSHAL', minXP: 23100, icon: '👑', color: '#B22222' },
    { level: 23, name: 'Comandante Supremo', nameKey: 'MEDALS.RANKS.SUPREME_COMMANDER', minXP: 25300, icon: '👑', color: '#8B0000' },
    { level: 24, name: 'Lenda Viva', nameKey: 'MEDALS.RANKS.LIVING_LEGEND', minXP: 27600, icon: '🏆', color: '#4B0082' },
    { level: 25, name: 'Mestre', nameKey: 'MEDALS.RANKS.MASTER', minXP: 30000, icon: '🏆', color: '#6A0DAD' },
    { level: 26, name: 'Grão-Mestre', nameKey: 'MEDALS.RANKS.GRANDMASTER', minXP: 32500, icon: '🏆', color: '#8A2BE2' },
    { level: 27, name: 'Virtuoso', nameKey: 'MEDALS.RANKS.VIRTUOSO', minXP: 35100, icon: '🏆', color: '#9370DB' },
    { level: 28, name: 'Prodígio', nameKey: 'MEDALS.RANKS.PRODIGY', minXP: 37800, icon: '💎', color: '#00CED1' },
    { level: 29, name: 'Ícone', nameKey: 'MEDALS.RANKS.ICON', minXP: 40600, icon: '💎', color: '#1E90FF' },
    { level: 30, name: 'Imortal', nameKey: 'MEDALS.RANKS.IMMORTAL', minXP: 43500, icon: '💎', color: '#0000FF' },
    { level: 31, name: 'Transcendente', nameKey: 'MEDALS.RANKS.TRANSCENDENT', minXP: 46500, icon: '✨', color: '#4169E1' },
    { level: 32, name: 'Eterno', nameKey: 'MEDALS.RANKS.ETERNAL', minXP: 50000, icon: '✨', color: '#191970' }
  ];

  // Sistema de medalhas (inspirado em Battlefield 2)
  medals: Medal[] = [
    // PROJECT MEDALS
    {
      id: 'project_basic',
      nameKey: 'MEDALS.PROJECT_BASIC.NAME',
      descriptionKey: 'MEDALS.PROJECT_BASIC.DESC',
      category: MedalCategory.PROJECTS,
      tier: MedalTier.LOCKED,
      progress: 0,
      maxProgress: 100,
      icon: '📁',
      requirements: { bronze: 5, silver: 25, gold: 50 }
    },
    {
      id: 'project_advanced',
      nameKey: 'MEDALS.PROJECT_ADVANCED.NAME',
      descriptionKey: 'MEDALS.PROJECT_ADVANCED.DESC',
      category: MedalCategory.PROJECTS,
      tier: MedalTier.LOCKED,
      progress: 0,
      maxProgress: 50,
      icon: '🚀',
      requirements: { bronze: 10, silver: 25, gold: 50 }
    },
    {
      id: 'project_mastery',
      nameKey: 'MEDALS.PROJECT_MASTERY.NAME',
      descriptionKey: 'MEDALS.PROJECT_MASTERY.DESC',
      category: MedalCategory.PROJECTS,
      tier: MedalTier.LOCKED,
      progress: 0,
      maxProgress: 100,
      icon: '🏗️',
      requirements: { bronze: 50, silver: 100, gold: 200 }
    },
    
    // SKILL MEDALS
    {
      id: 'skill_collector',
      nameKey: 'MEDALS.SKILL_COLLECTOR.NAME',
      descriptionKey: 'MEDALS.SKILL_COLLECTOR.DESC',
      category: MedalCategory.SKILLS,
      tier: MedalTier.LOCKED,
      progress: 0,
      maxProgress: 100,
      icon: '🎯',
      requirements: { bronze: 5, silver: 15, gold: 30 }
    },
    {
      id: 'skill_expert',
      nameKey: 'MEDALS.SKILL_EXPERT.NAME',
      descriptionKey: 'MEDALS.SKILL_EXPERT.DESC',
      category: MedalCategory.SKILLS,
      tier: MedalTier.LOCKED,
      progress: 0,
      maxProgress: 50,
      icon: '🎓',
      requirements: { bronze: 10, silver: 20, gold: 40 }
    },
    {
      id: 'polyglot',
      nameKey: 'MEDALS.POLYGLOT.NAME',
      descriptionKey: 'MEDALS.POLYGLOT.DESC',
      category: MedalCategory.SKILLS,
      tier: MedalTier.LOCKED,
      progress: 0,
      maxProgress: 20,
      icon: '🌐',
      requirements: { bronze: 3, silver: 7, gold: 12 }
    },

    // COLLABORATION MEDALS
    {
      id: 'team_player',
      nameKey: 'MEDALS.TEAM_PLAYER.NAME',
      descriptionKey: 'MEDALS.TEAM_PLAYER.DESC',
      category: MedalCategory.COLLABORATION,
      tier: MedalTier.LOCKED,
      progress: 0,
      maxProgress: 50,
      icon: '🤝',
      requirements: { bronze: 3, silver: 10, gold: 25 }
    },
    {
      id: 'mentor',
      nameKey: 'MEDALS.MENTOR.NAME',
      descriptionKey: 'MEDALS.MENTOR.DESC',
      category: MedalCategory.COLLABORATION,
      tier: MedalTier.LOCKED,
      progress: 0,
      maxProgress: 30,
      icon: '👨‍🏫',
      requirements: { bronze: 2, silver: 8, gold: 15 }
    },
    {
      id: 'community_leader',
      nameKey: 'MEDALS.COMMUNITY_LEADER.NAME',
      descriptionKey: 'MEDALS.COMMUNITY_LEADER.DESC',
      category: MedalCategory.COLLABORATION,
      tier: MedalTier.LOCKED,
      progress: 0,
      maxProgress: 100,
      icon: '👑',
      requirements: { bronze: 20, silver: 50, gold: 100 }
    },

    // LEARNING MEDALS
    {
      id: 'eternal_student',
      nameKey: 'MEDALS.ETERNAL_STUDENT.NAME',
      descriptionKey: 'MEDALS.ETERNAL_STUDENT.DESC',
      category: MedalCategory.LEARNING,
      tier: MedalTier.LOCKED,
      progress: 0,
      maxProgress: 20,
      icon: '📚',
      requirements: { bronze: 3, silver: 8, gold: 15 }
    },
    {
      id: 'certification_hunter',
      nameKey: 'MEDALS.CERTIFICATION_HUNTER.NAME',
      descriptionKey: 'MEDALS.CERTIFICATION_HUNTER.DESC',
      category: MedalCategory.LEARNING,
      tier: MedalTier.LOCKED,
      progress: 0,
      maxProgress: 30,
      icon: '🏅',
      requirements: { bronze: 2, silver: 5, gold: 10 }
    },

    // ACHIEVEMENT MEDALS
    {
      id: 'published_author',
      nameKey: 'MEDALS.PUBLISHED_AUTHOR.NAME',
      descriptionKey: 'MEDALS.PUBLISHED_AUTHOR.DESC',
      category: MedalCategory.ACHIEVEMENT,
      tier: MedalTier.LOCKED,
      progress: 0,
      maxProgress: 50,
      icon: '✍️',
      requirements: { bronze: 3, silver: 10, gold: 25 }
    },
    {
      id: 'influencer',
      nameKey: 'MEDALS.INFLUENCER.NAME',
      descriptionKey: 'MEDALS.INFLUENCER.DESC',
      category: MedalCategory.ACHIEVEMENT,
      tier: MedalTier.LOCKED,
      progress: 0,
      maxProgress: 1000,
      icon: '📢',
      requirements: { bronze: 100, silver: 500, gold: 1000 }
    },

    // SPECIAL MEDALS
    {
      id: 'early_adopter',
      nameKey: 'MEDALS.EARLY_ADOPTER.NAME',
      descriptionKey: 'MEDALS.EARLY_ADOPTER.DESC',
      category: MedalCategory.SPECIAL,
      tier: MedalTier.GOLD,
      progress: 1,
      maxProgress: 1,
      icon: '🌟',
      requirements: { bronze: 1, silver: 1, gold: 1 },
      unlockedAt: new Date('2024-01-15')
    },
    {
      id: 'innovation_award',
      nameKey: 'MEDALS.INNOVATION_AWARD.NAME',
      descriptionKey: 'MEDALS.INNOVATION_AWARD.DESC',
      category: MedalCategory.SPECIAL,
      tier: MedalTier.LOCKED,
      progress: 0,
      maxProgress: 5,
      icon: '💡',
      requirements: { bronze: 1, silver: 3, gold: 5 }
    }
  ];

  ngOnInit() {
    this.calculateCurrentRank();
    this.updateMedalProgress();
  }

  calculateCurrentRank() {
    // Encontra o rank atual baseado no XP
    for (let i = this.ranks.length - 1; i >= 0; i--) {
      if (this.userProgress.currentXP >= this.ranks[i].minXP) {
        this.currentRank = this.ranks[i];
        this.nextRank = this.ranks[i + 1] || undefined;
        break;
      }
    }

    // Calcula progresso até o próximo rank
    if (this.nextRank) {
      const xpInCurrentRank = this.userProgress.currentXP - this.currentRank.minXP;
      const xpNeededForNext = this.nextRank.minXP - this.currentRank.minXP;
      this.progressToNextRank = (xpInCurrentRank / xpNeededForNext) * 100;
    } else {
      this.progressToNextRank = 100;
    }
  }

  updateMedalProgress() {
    // Atualiza progresso das medalhas baseado nas conquistas do usuário
    this.medals.forEach(medal => {
      switch (medal.id) {
        case 'project_basic':
        case 'project_advanced':
        case 'project_mastery':
          medal.progress = this.userProgress.totalProjects;
          break;
        case 'skill_collector':
        case 'skill_expert':
        case 'polyglot':
          medal.progress = this.userProgress.totalSkills;
          break;
        case 'team_player':
        case 'mentor':
        case 'community_leader':
          medal.progress = this.userProgress.totalCollaborations;
          break;
        case 'certification_hunter':
          medal.progress = this.userProgress.certificationsEarned;
          break;
        case 'published_author':
          medal.progress = this.userProgress.articlesPublished;
          break;
      }

      // Determina o tier baseado no progresso
      medal.tier = this.calculateMedalTier(medal);
    });
  }

  calculateMedalTier(medal: Medal): MedalTier {
    if (medal.progress >= medal.requirements.gold) {
      return MedalTier.GOLD;
    } else if (medal.progress >= medal.requirements.silver) {
      return MedalTier.SILVER;
    } else if (medal.progress >= medal.requirements.bronze) {
      return MedalTier.BRONZE;
    }
    return MedalTier.LOCKED;
  }

  get filteredMedals(): Medal[] {
    if (this.selectedCategory === 'all') {
      return this.medals;
    }
    return this.medals.filter(m => m.category === this.selectedCategory);
  }

  getMedalOpacity(tier: MedalTier): number {
    switch (tier) {
      case MedalTier.LOCKED: return 0.3;
      case MedalTier.BRONZE: return 0.7;
      case MedalTier.SILVER: return 0.85;
      case MedalTier.GOLD: return 1;
      default: return 0.3;
    }
  }

  getMedalColor(tier: MedalTier): string {
    switch (tier) {
      case MedalTier.BRONZE: return '#CD7F32';
      case MedalTier.SILVER: return '#C0C0C0';
      case MedalTier.GOLD: return '#FFD700';
      default: return '#666666';
    }
  }

  getCategoryIcon(category: MedalCategory | 'all'): string {
    const icons = {
      all: '🏆',
      projects: '📁',
      skills: '🎯',
      collaboration: '🤝',
      learning: '📚',
      achievement: '🏅',
      special: '⭐'
    };
    return icons[category];
  }
}
