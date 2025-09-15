// Debug utility for testing request approval permissions
import { supabase } from '../lib/supabaseClient';

export const debugRequestApproval = async (requestId: string, userId: string) => {
  console.log('🔍 Debugging Request Approval Process...');
  
  try {
    // 1. Check current user
    console.log('1. Checking current user...');
    const { data: user, error: userError } = await supabase.auth.getUser();
    console.log('Current auth user:', { user: user?.user, error: userError });
    
    // 2. Check user role from users table
    console.log('2. Checking user role...');
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('id, name, role, isactive')
      .eq('id', userId)
      .single();
    console.log('User data:', { userData, error: userDataError });
    
    // 3. Check if request exists
    console.log('3. Checking if request exists...');
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .single();
    console.log('Request data:', { request, error: requestError });
    
    // 4. Test RLS policy by trying to read the request
    console.log('4. Testing RLS policy (SELECT)...');
    const { data: selectTest, error: selectError } = await supabase
      .from('requests')
      .select('id, status, employeeid')
      .eq('id', requestId);
    console.log('SELECT test:', { selectTest, error: selectError });
    
    // 5. Test RLS policy by trying to update the request
    console.log('5. Testing RLS policy (UPDATE)...');
    const { data: updateTest, error: updateError } = await supabase
      .from('requests')
      .update({ 
        status: 'pending', // Just test with same status
        reviewedat: new Date().toISOString()
      })
      .eq('id', requestId)
      .select();
    console.log('UPDATE test:', { updateTest, error: updateError });
    
    // 6. Check if user has admin/stock-manager role
    console.log('6. Checking user permissions...');
    const hasPermission = userData?.role === 'admin' || userData?.role === 'stock-manager';
    console.log('Has permission:', hasPermission);
    
    return {
      success: true,
      user: userData,
      request: request,
      hasPermission: hasPermission,
      selectTest: { data: selectTest, error: selectError },
      updateTest: { data: updateTest, error: updateError }
    };
    
  } catch (error) {
    console.error('Debug error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).debugRequestApproval = debugRequestApproval;
}
