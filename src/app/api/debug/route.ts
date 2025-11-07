// app/api/debug/route.ts
export async function POST(request: Request) {
  console.log('🎯 Debug endpoint HIT!');
  
  try {
    const formData = await request.formData();
    console.log('📝 FormData recibido:');
    
    const data: any = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value instanceof File ? `File: ${value.name}` : value;
    }
    
    console.log('📊 Datos:', data);
    
    return Response.json({ 
      success: true, 
      message: 'Debug funcionando',
      received: data 
    });
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
    return Response.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}