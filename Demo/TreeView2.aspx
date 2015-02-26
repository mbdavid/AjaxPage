<%@ Page Title="" Language="C#" MasterPageFile="~/Content/Page.Master" AutoEventWireup="true" %>
<script runat="server">

    private Random _rnd = new Random();

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
        }
    }


    protected void trv_SelectedNodeChanged(object sender, EventArgs e)
    {
        txt.Text = trv.SelectedNode.Text;
    }

    protected void btn_Click(object sender, EventArgs e)
    {
        trv.ExpandDepth = 0;
        trv.Visible = !trv.Visible;
    }

    protected void trv_TreeNodePopulate(object sender, TreeNodeEventArgs e)
    {
        for(var i = 0; i < 10; i++)
        {
            var node = new TreeNode("child node " + _rnd.Next(10000));
            node.Expanded = false;
            node.PopulateOnDemand = true;

            e.Node.ChildNodes.Add(node);   
        }
        
    }
</script>
<asp:Content ID="ctrContent" ContentPlaceHolderID="content" runat="server">

    Selected Value: <asp:TextBox runat="server" ID="txt" /><br /><br />
    
    <asp:Button runat="server" ID="btn" Text="Show/Hide TreeView" OnClick="btn_Click" />

    <hr />

    <asp:TreeView runat="server" ID="trv" ImageSet="News" NodeIndent="10" Visible="true" 
        onselectednodechanged="trv_SelectedNodeChanged"
        PopulateNodesFromClient="true"
        OnTreeNodePopulate="trv_TreeNodePopulate">
        <HoverNodeStyle Font-Underline="True" />
        <Nodes>
            <asp:TreeNode Text="Root" Value="Root" PopulateOnDemand="true"></asp:TreeNode>
        </Nodes>
        <ParentNodeStyle Font-Bold="False" />
        <SelectedNodeStyle BackColor="Blue" ForeColor="White" />
    </asp:TreeView>


</asp:Content>
