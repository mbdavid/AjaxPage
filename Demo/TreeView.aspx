<%@ Page Title="" Language="C#" MasterPageFile="~/Content/Page.Master" AutoEventWireup="true" %>
<script runat="server">

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
        }
    }


    protected void trv_SelectedNodeChanged(object sender, EventArgs e)
    {
        txt.Text = trv.SelectedNode.Text;

        if (txt.Text == "1 - Ativo")
        {
            throw new Exception("Não aceito esse nodo selecionado!");
        }

    }

    protected void btn_Click(object sender, EventArgs e)
    {
        trv.Visible = true;
    }

</script>
<asp:Content ID="ctrContent" ContentPlaceHolderID="content" runat="server">

    <asp:TextBox runat="server" ID="txt" /><asp:Button runat="server" ID="btn" Text="Exibir" OnClick="btn_Click" />

    <asp:TreeView runat="server" ID="trv" ImageSet="News" NodeIndent="10" Visible="false" onselectednodechanged="trv_SelectedNodeChanged">
        <HoverNodeStyle Font-Underline="True" />
        <Nodes>
            <asp:TreeNode Text="Root" Value="Root">
                <asp:TreeNode Text="1 - Ativo" Value="1 - Ativo">
                    <asp:TreeNode Text="1.1 - Conta Banco" Value="1.1 - Conta Banco"></asp:TreeNode>
                </asp:TreeNode>
                <asp:TreeNode Text="2 - Passivo" Value="2 - Passivo"></asp:TreeNode>
            </asp:TreeNode>
        </Nodes>
        <NodeStyle Font-Names="Arial" Font-Size="10pt" ForeColor="Black" HorizontalPadding="5px" NodeSpacing="0px" VerticalPadding="0px" />
        <ParentNodeStyle Font-Bold="False" />
        <SelectedNodeStyle Font-Underline="True" HorizontalPadding="0px" VerticalPadding="0px" />
    </asp:TreeView>


</asp:Content>
