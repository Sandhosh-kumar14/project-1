import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchTeamMembers } from '../../store/slices/teamSlice';
import { User, Mail, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TeamView: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, loading } = useSelector((state: RootState) => state.team);
  
  useEffect(() => {
    dispatch(fetchTeamMembers());
  }, [dispatch]);
  
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Team Members</h2>
      
      <div className="space-y-4">
        {members.map(member => (
          <div 
            key={member._id}
            className="p-4 border border-gray-200 rounded-lg flex items-center gap-4 hover:border-primary-300 transition-colors"
          >
            <div className={`w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-lg ${
              member.isOnline ? 'ring-2 ring-green-400' : ''
            }`}>
              {member.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{member.name}</h3>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  member.isOnline 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="capitalize">{member.role}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {member.email}
                </span>
                {!member.isOnline && member.lastActive && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last seen {formatDistanceToNow(new Date(member.lastActive))} ago
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamView;