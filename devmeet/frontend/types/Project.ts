export type TeamMember = {
    id: number; 
    //role: string;
    email: string;
    full_name: string;
    project_id: number;
    added_at: string
    role: 'admin' | 'moderator' | 'member' | 'supervisor'; // Enum from DB
    specialization?: string;
   
  };
  
  export type Project = {
    files: any[];
    progress: number;
    teamIds: any;
    projectTeam?: TeamMember[]; 
    // name: string;
    id: number; // If applicable
    title: string;
    description: string;
    projectType: 'solo' | 'collaborative';
    thumbnail?: string;
    status: string;
    startDate?: string; // Add startDate
    endDate?: string;   // Add endDate
    teamMembers?: {
      profilePicture: string; role: string; email: string; id: number; name: string; project_id: number
}[]; 

  };
  
 

