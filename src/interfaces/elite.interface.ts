export interface BoardSubmission {
    approve: EliteProfile;
    comment: string;
    id: string;
    live: boolean;
    medal: string;
    monkey: any;
    obsolete: boolean;
    platform: any;
    profile: EliteProfile;
    proof: string;
    record: number;
    region: any;
    report: any;
    submitted_at: any;
    tas: boolean;
}

export interface RecentSubmission {
    all_position: number;
    position: number;
    id: string;
    proof: string;
    record: number;
    score: boolean;
    tas: boolean;
    level: EliteLevel;
    profile: EliteProfile;
    version: EliteVersion;
}

export interface EliteLevel {
    category: string;
    name: string;
    timer_type: string;
    mode: EliteMode;
}

export interface EliteMode {
    game: EliteGame;
}

export interface EliteGame {
    name: string;
    abb: string;
}

export interface EliteProfile {
    country: string;
    id: number;
    username: string;
}

export interface EliteVersion {
    id: number;
    sequence: number;
    version: string;
}
