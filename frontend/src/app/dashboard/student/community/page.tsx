'use client';

import { useState, useEffect, useMemo, useRef } from "react";
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Send, 
  Users, 
  Trophy, 
  TrendingUp, 
  MoreVertical, 
  PlusCircle, 
  Zap, 
  Award,
  Clock,
  Hash,
  Sparkles,
  X,
  Image as ImageIcon
} from "lucide-react";
import clsx from 'clsx';
import apiClient from "@/lib/axios";

// ── 1. TYPES ───────────────────────────────────────────────────────────────

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: Date;
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  role: string;
  content: string;
  image?: string | null;
  likes: number;
  hasLiked: boolean;
  comments: Comment[];
  createdAt: Date;
  tags: string[];
  isUserPost?: boolean;
}

interface Contributor {
  name: string;
  points: number;
  role: string;
  avatar: string;
}

const PREDEFINED_TAGS = ["InterviewExperience", "Zomato", "SystemDesign", "DSA", "Frontend", "Backend"];

const MOCK_CONTRIBUTORS: Contributor[] = [
  { name: "Rahul S.", points: 1240, role: "System Design Pro", avatar: "RS" },
  { name: "Anita K.", points: 980, role: "React Expert", avatar: "AK" },
  { name: "Kiran V.", points: 750, role: "DSA Master", avatar: "KV" },
  { name: "Siddharth M.", points: 620, role: "Node.js Guru", avatar: "SM" },
  { name: "Priya P.", points: 540, role: "UI Architect", avatar: "PP" }
];

// ────────────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [shuffledContributors, setShuffledContributors] = useState<Contributor[]>(MOCK_CONTRIBUTORS);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 2. INITIALIZATION ─────────────────────────────────────────────────────

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/community/posts/');
      // Map API response to Post interface if needed, or just set it
      // The backend returns: id, author (name), content, created_at, tags (as list)
      const mappedPosts = res.data.map((p: any) => ({
        id: p.id,
        author: p.author,
        avatar: p.author.charAt(0).toUpperCase(),
        role: "Student", // Defaulting role as backend doesn't return it yet
        content: p.content,
        likes: 0,
        hasLiked: false,
        comments: [],
        createdAt: new Date(p.created_at),
        tags: p.tags,
        isUserPost: false // We could check against current user, but skipping for now
      }));
      setPosts(mappedPosts);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setIsLoading(false);
      setShuffledContributors([...MOCK_CONTRIBUTORS].sort(() => 0.5 - Math.random()));
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Modal ESC Control
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLeaderboard(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // ── 3. ACTIONS ────────────────────────────────────────────────────────────

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!input.trim() && !selectedImage) return;

    try {
      await apiClient.post('/community/posts/', {
        content: input,
        tags: selectedTags
      });
      setInput("");
      setSelectedImage(null);
      setSelectedTags([]);
      fetchPosts(); // Refetch after post
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  const handleLike = (id: number) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
          hasLiked: !p.hasLiked
        };
      }
      return p;
    }));
  };

  const handleComment = (postId: number) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            { id: Date.now(), author: "You", content: commentText, createdAt: new Date() }
          ]
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  // ── 4. SUB-COMPONENTS ─────────────────────────────────────────────────────

  const PostSkeleton = () => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="space-y-2">
          <div className="w-32 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="w-5/6 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );

  const LeaderboardModal = () => (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setShowLeaderboard(false)}
      />
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-amber-500/10 rounded-2xl">
                  <Trophy className="w-6 h-6 text-amber-500" />
               </div>
               <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Community Leaderboard</h2>
            </div>
            <button 
              onClick={() => setShowLeaderboard(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          
          <div className="space-y-4">
            {MOCK_CONTRIBUTORS.map((user, i) => (
              <div key={user.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                 <div className="flex items-center gap-4">
                    <div className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                      i === 0 ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                    )}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.role}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-black text-blue-600">{user.points} pts</p>
                 </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setShowLeaderboard(false)}
            className="w-full mt-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );

  // ── 5. RENDER ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      
      {showLeaderboard && <LeaderboardModal />}

      {/* Header Section */}
      <div className="mb-10 p-8 sm:p-10 bg-slate-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-700">
           <Users className="w-48 h-48" />
         </div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <div className="px-3 py-1 bg-blue-500 text-[10px] font-black rounded-lg uppercase tracking-widest">
                 Live Feed
               </div>
               <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Community Active
               </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Social Intelligence</h1>
            <p className="text-slate-400 font-medium max-w-xl">Share your interview experience, ask doubts, or help others climb the ladder.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Create Post Box */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 transition-all hover:shadow-2xl">
             <div className="flex gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-600/20">
                   Y
                </div>
                <div className="flex-1 space-y-4">
                  <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Share your interview experience, ask doubts, or help others..."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium leading-relaxed focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 resize-none min-h-[100px]"
                  />
                  
                  {/* Image Preview */}
                  {selectedImage && (
                    <div className="relative group/preview animate-in fade-in zoom-in duration-300">
                      <img 
                        src={selectedImage} 
                        alt="Preview" 
                        className="w-full max-h-[300px] object-cover rounded-2xl border border-slate-100 dark:border-slate-800"
                      />
                      <button 
                        onClick={removeSelectedImage}
                        className="absolute top-2 right-2 p-2 bg-slate-900/50 text-white rounded-full hover:bg-slate-900 transition-colors backdrop-blur-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Tag Selection */}
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_TAGS.map(tag => (
                      <button 
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={clsx(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                          selectedTags.includes(tag) 
                            ? "bg-blue-600 text-white shadow-lg" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                      >
                        # {tag}
                      </button>
                    ))}
                  </div>
                </div>
             </div>

             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleImageChange} 
               accept="image/*" 
               className="hidden" 
             />

             <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
                <div className="flex items-center gap-4 text-slate-400">
                   <button 
                    onClick={handleImageClick}
                    className="flex items-center gap-2 hover:text-blue-500 transition-colors active:scale-95"
                   >
                      <ImageIcon className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Add Image</span>
                   </button>
                   <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
                   <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                     <Hash className="w-3 h-3" /> {selectedTags.length} tags selected
                   </p>
                </div>
                <button 
                   onClick={handlePost}
                   disabled={!input.trim() && !selectedImage}
                   className={clsx(
                     "px-10 py-4 font-black rounded-xl transition-all flex items-center gap-2",
                     (!input.trim() && !selectedImage)
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20"
                   )}
                >
                   POST EXPERIENCE <Send className="w-4 h-4" />
                </button>
             </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
             {isLoading ? (
               <>
                 <PostSkeleton />
                 <PostSkeleton />
                 <PostSkeleton />
               </>
             ) : posts.length === 0 ? (
               <div className="py-20 text-center animate-in fade-in zoom-in duration-700">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                     <MessageSquare className="w-10 h-10 text-slate-400" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">No posts yet</h2>
                  <p className="text-slate-400 font-medium mt-2">Be the first to share your experience!</p>
               </div>
             ) : (
               posts.map((post) => (
                 <div 
                   key={post.id} 
                   className={clsx(
                     "bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border shadow-sm animate-in slide-in-from-bottom-4 duration-500 transition-all hover:scale-[1.01] hover:shadow-xl",
                     post.isUserPost 
                      ? "border-blue-500/30 ring-1 ring-blue-500/10 shadow-blue-500/5" 
                      : "border-slate-100 dark:border-slate-800"
                   )}
                 >
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-4">
                          <div className={clsx(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm",
                            post.isUserPost ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          )}>
                             {post.avatar}
                          </div>
                          <div>
                             <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                                {post.author}
                                {post.isUserPost && <span className="text-[8px] px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded uppercase tracking-[0.2em] font-black">Your Post</span>}
                             </h3>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                {post.role} • <Clock className="w-3 h-3" /> {formatTime(post.createdAt)}
                             </p>
                          </div>
                       </div>
                       <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                          <MoreVertical className="w-5 h-5 text-slate-400" />
                       </button>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-6 whitespace-pre-wrap">
                       {post.content}
                    </p>

                    {/* Post Image */}
                    {post.image && (
                      <div className="mb-6 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-lg">
                        <img src={post.image} alt="Post" className="w-full object-cover max-h-[400px]" />
                      </div>
                    )}

                    {/* Post Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {(Array.isArray(post.tags) ? post.tags : []).map((tag: string) => (
                          <span key={tag} className="text-xs font-black text-blue-500 hover:underline cursor-pointer">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-6 border-t border-slate-50 dark:border-slate-800 pt-6">
                       <button 
                          onClick={() => handleLike(post.id)}
                          className={clsx(
                             "flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all active:scale-90",
                             post.hasLiked ? "text-rose-500" : "text-slate-400 hover:text-rose-500"
                          )}
                       >
                          <Heart className={clsx("w-5 h-5 transition-transform", post.hasLiked && "fill-current scale-110")} /> {post.likes}
                       </button>
                       <button className="flex items-center gap-2 text-slate-400 hover:text-blue-500 text-xs font-black uppercase tracking-widest transition-colors">
                          <MessageSquare className="w-5 h-5" /> {post.comments.length}
                       </button>
                       <button className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 text-xs font-black uppercase tracking-widest transition-colors">
                          <Share2 className="w-5 h-5" /> Share
                       </button>
                    </div>

                    {/* Enhanced Comment System */}
                    <div className="mt-8 space-y-4">
                       {post.comments.slice(-2).map(comment => (
                         <div key={comment.id} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl flex gap-4 animate-in fade-in duration-300">
                            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500">
                               {comment.author === "You" ? "Y" : comment.author[0]}
                            </div>
                            <div className="flex-1">
                               <div className="flex justify-between items-center mb-1">
                                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                     {comment.author}
                                  </p>
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{formatTime(comment.createdAt)}</span>
                               </div>
                               <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-normal">{comment.content}</p>
                            </div>
                         </div>
                       ))}
                       
                       <div className="flex gap-4 pt-2">
                          <input 
                             value={commentInputs[post.id] || ""}
                             onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                             placeholder="Add a comment..."
                             className="flex-1 bg-white dark:bg-slate-900 px-6 py-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all shadow-inner"
                             onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                          />
                          <button 
                             onClick={() => handleComment(post.id)}
                             disabled={!commentInputs[post.id]?.trim()}
                             className="p-4 bg-blue-600 text-white rounded-xl hover:scale-105 active:scale-90 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:scale-100"
                          >
                             <Send className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Contributors Panel */}
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-3 bg-amber-500/10 rounded-2xl">
                    <Trophy className="w-6 h-6 text-amber-500" />
                 </div>
                 <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Top Contributors</h3>
              </div>
              <div className="space-y-6">
                 {shuffledContributors.map((user, i) => (
                   <div key={user.name} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-transform">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            {user.avatar}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.role}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-black text-blue-600">{user.points}</p>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Points</p>
                      </div>
                   </div>
                 ))}
              </div>
              <button 
                onClick={() => setShowLeaderboard(true)}
                className="w-full mt-8 py-4 bg-slate-50 dark:bg-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-700 active:scale-95"
              >
                 VIEW LEADERBOARD
              </button>
           </div>

           {/* Quick Intelligence Tips */}
           <div className="p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <Sparkles className="w-20 h-20" />
              </div>
              <h3 className="text-xl font-black mb-4 tracking-tight flex items-center gap-2">
                 <Zap className="w-5 h-5 fill-current" /> Career Tip
              </h3>
              <p className="text-sm font-bold text-blue-100 leading-relaxed">
                "Sharing your interview experiences with images increases your engagement rate by 2.5x among peers."
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
